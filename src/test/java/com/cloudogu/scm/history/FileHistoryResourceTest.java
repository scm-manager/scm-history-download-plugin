/*
 * Copyright (c) 2020 - present Cloudogu GmbH
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/.
 */

package com.cloudogu.scm.history;

import de.otto.edison.hal.HalRepresentation;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Answers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import sonia.scm.api.v2.resources.ScmPathInfoStore;
import sonia.scm.api.v2.resources.SourceLinkProvider;
import sonia.scm.repository.Changeset;
import sonia.scm.repository.ChangesetPagingResult;
import sonia.scm.repository.Repository;
import sonia.scm.repository.RepositoryTestData;
import sonia.scm.repository.api.LogCommandBuilder;
import sonia.scm.repository.api.RepositoryService;
import sonia.scm.repository.api.RepositoryServiceFactory;

import java.io.IOException;
import java.net.URI;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileHistoryResourceTest {

  private static final Repository REPOSITORY = RepositoryTestData.createHeartOfGold();

  @Mock
  private RepositoryServiceFactory repositoryServiceFactory;
  @Mock
  private RepositoryService repositoryService;
  @Mock(answer = Answers.RETURNS_SELF)
  private LogCommandBuilder logCommandBuilder;
  @Mock
  private SourceLinkProvider sourceLinkProvider;
  @Mock
  private ScmPathInfoStore scmPathInfoStore;

  private FileHistoryResource resource;

  @BeforeEach
  void setUp() {
    FileHistoryDtoMapper dtoMapper = new FileHistoryDtoMapper(sourceLinkProvider);
    HistoryLinks historyLinks = new HistoryLinks(() -> scmPathInfoStore);
    resource = new FileHistoryResource(repositoryServiceFactory, dtoMapper, historyLinks);

    when(repositoryServiceFactory.create(REPOSITORY.getNamespaceAndName()))
      .thenReturn(repositoryService);
    when(repositoryService.getLogCommand())
      .thenReturn(logCommandBuilder);
  }

  @Test
  void shouldCreateHistory() throws IOException {
    when(logCommandBuilder.getChangesets())
      .thenReturn(new ChangesetPagingResult(
        42,
        List.of(
          new Changeset(
            "1",
            Instant.parse("2024-10-13T11:45:27.0Z").toEpochMilli(),
            null,
            "first"
          ),
          new Changeset(
            "2",
            Instant.parse("2024-10-14T11:45:27.0Z").toEpochMilli(),
            null,
            "second"
          )
        )
      ));
    when(scmPathInfoStore.get()).thenReturn(() -> URI.create("/scm/api/v2/"));
    when(sourceLinkProvider.getSourceWithPath(
      eq(REPOSITORY.getNamespaceAndName()),
      any(),
      any())
    ).thenAnswer(invocationOnMock -> String.format("/scm/api/v2/sources/%s/%s",invocationOnMock.getArgument(1), invocationOnMock.getArgument(2)));

    FileHistoryCollectionDto fileHistory = resource.getFileHistory(
      REPOSITORY.getNamespace(),
      REPOSITORY.getName(),
      "1",
      "some/file.txt",
      0,
      10
    );

    assertThat(fileHistory.getPage()).isEqualTo(0);
    assertThat(fileHistory.getPageTotal()).isEqualTo(5);
    List<HalRepresentation> history = fileHistory.getEmbedded().getItemsBy("history");
    assertThat(history).hasSize(2);
    assertThat(history.get(0).getLinks().getLinkBy("self")).get().extracting("href")
      .isEqualTo("/scm/api/v2/sources/1/some/file.txt");
    assertThat(history.get(1).getLinks().getLinkBy("self")).get().extracting("href")
      .isEqualTo("/scm/api/v2/sources/2/some/file.txt");
    assertThat(((FileHistoryDto) history.get(0)).getDescription())
      .isEqualTo("first");
    assertThat(((FileHistoryDto) history.get(1)).getDescription())
      .isEqualTo("second");
  }
}
