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

import de.otto.edison.hal.Embedded;
import de.otto.edison.hal.HalRepresentation;
import de.otto.edison.hal.Links;
import de.otto.edison.hal.paging.NumberedPaging;
import de.otto.edison.hal.paging.PagingRel;
import jakarta.inject.Inject;
import sonia.scm.api.v2.resources.SourceLinkProvider;
import sonia.scm.repository.Changeset;
import sonia.scm.repository.ChangesetPagingResult;
import sonia.scm.repository.NamespaceAndName;

import java.util.EnumSet;
import java.util.List;

import static com.damnhandy.uri.template.UriTemplate.fromTemplate;
import static de.otto.edison.hal.Embedded.embeddedBuilder;
import static de.otto.edison.hal.Links.linkingTo;
import static de.otto.edison.hal.paging.NumberedPaging.zeroBasedNumberedPaging;

public class FileHistoryDtoMapper {

  private final SourceLinkProvider sourceLinkProvider;

  @Inject
  public FileHistoryDtoMapper(SourceLinkProvider sourceLinkProvider) {
    this.sourceLinkProvider = sourceLinkProvider;
  }

  FileHistoryCollectionDto map(int pageNumber, int pageSize, ChangesetPagingResult pagingResult, String selfLink, NamespaceAndName namespaceAndName, String path) {
    int overallCount = pagingResult.getTotal();
    List<FileHistoryDto> dtos = pagingResult.getChangesets().stream().map(c -> map(c, namespaceAndName, path)).toList();
    NumberedPaging paging = zeroBasedNumberedPaging(pageNumber, pageSize, overallCount);
    Links links = createLinks(paging, selfLink);
    Embedded embedded = embedDtos(dtos);
    FileHistoryCollectionDto collectionDto = createCollectionDto(links, embedded);
    collectionDto.setPage(pageNumber);
    collectionDto.setPageTotal(computePageTotal(pageSize, overallCount));
    return collectionDto;
  }

  private FileHistoryDto map(Changeset changeset, NamespaceAndName namespaceAndName, String path) {
    String link = sourceLinkProvider.getSourceWithPath(namespaceAndName, changeset.getId(), path);
    return new FileHistoryDto(linkingTo().self(link).build(), changeset);
  }

  private FileHistoryCollectionDto createCollectionDto(Links links, Embedded embedded) {
    return new FileHistoryCollectionDto(links, embedded);
  }

  private Links createLinks(NumberedPaging page, String selfLink) {
    Links.Builder linksBuilder = linkingTo()
      .with(page.links(
        fromTemplate(selfLink + "{?page,pageSize}"),
        EnumSet.allOf(PagingRel.class)));
    return linksBuilder.build();
  }

  private Embedded embedDtos(List<FileHistoryDto> dtos) {
    return embeddedBuilder()
      .with("history", dtos)
      .build();
  }

  private int computePageTotal(int pageSize, int overallCount) {
    if (overallCount % pageSize > 0) {
      return overallCount / pageSize + 1;
    } else {
      return overallCount / pageSize;
    }
  }
}
