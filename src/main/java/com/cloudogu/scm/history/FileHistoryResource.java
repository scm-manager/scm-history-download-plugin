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
import jakarta.inject.Inject;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import sonia.scm.plugin.Extension;
import sonia.scm.repository.ChangesetPagingResult;
import sonia.scm.repository.NamespaceAndName;
import sonia.scm.repository.api.RepositoryService;
import sonia.scm.repository.api.RepositoryServiceFactory;

import java.io.IOException;

@Path("v2/file-history/")
@Extension
public class FileHistoryResource {

  private final RepositoryServiceFactory repositoryServiceFactory;
  private final FileHistoryDtoMapper dtoMapper;
  private final HistoryLinks historyLinks;

  @Inject
  public FileHistoryResource(RepositoryServiceFactory repositoryServiceFactory,
                             FileHistoryDtoMapper dtoMapper,
                             HistoryLinks historyLinks
  ) {
    this.repositoryServiceFactory = repositoryServiceFactory;
    this.dtoMapper = dtoMapper;
    this.historyLinks = historyLinks;
  }

  @GET
  @Produces(MediaType.APPLICATION_JSON)
  @Path("{namespace}/{name}/{revision}/{path: .*}")
  public FileHistoryCollectionDto getFileHistory(@PathParam("namespace") String namespace,
                                          @PathParam("name") String name,
                                          @PathParam("revision") String revision,
                                          @PathParam("path") String path,
                                          @QueryParam("page") @DefaultValue("0") int page,
                                          @QueryParam("pageSize") @DefaultValue("10") int pageSize) {
    try (RepositoryService repositoryService = repositoryServiceFactory.create(new NamespaceAndName(namespace, name))) {
      ChangesetPagingResult changesets =
        repositoryService
          .getLogCommand()
          .setPath(path)
          .setStartChangeset(revision)
          .setPagingStart(page * pageSize)
          .setPagingLimit(pageSize)
          .getChangesets();
      String selfLink = historyLinks.createFileHistoryLink(namespace, name, revision, path);
      return dtoMapper.map(page, pageSize, changesets, selfLink, new NamespaceAndName(namespace, name), path);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }
}
