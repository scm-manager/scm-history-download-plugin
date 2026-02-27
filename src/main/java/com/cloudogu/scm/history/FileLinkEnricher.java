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

import jakarta.inject.Inject;
import sonia.scm.api.v2.resources.Enrich;
import sonia.scm.api.v2.resources.HalAppender;
import sonia.scm.api.v2.resources.HalEnricher;
import sonia.scm.api.v2.resources.HalEnricherContext;
import sonia.scm.plugin.Extension;
import sonia.scm.repository.BrowserResult;
import sonia.scm.repository.FileObject;
import sonia.scm.repository.NamespaceAndName;

@Extension
@Enrich(FileObject.class)
public class FileLinkEnricher implements HalEnricher {

  private final HistoryLinks historyLinks;

  @Inject
  public FileLinkEnricher(HistoryLinks historyLinks) {
    this.historyLinks = historyLinks;
  }

  @Override
  public void enrich(HalEnricherContext halEnricherContext, HalAppender halAppender) {
    NamespaceAndName namespaceAndName = halEnricherContext.oneRequireByType(NamespaceAndName.class);
    BrowserResult result = halEnricherContext.oneRequireByType(BrowserResult.class);
    FileObject fileObject = halEnricherContext.oneRequireByType(FileObject.class);
    if (result.getRequestedRevision() == null) {
      return;
    }
    halAppender.appendLink("file-history",
      historyLinks.createFileHistoryLink(namespaceAndName.getNamespace(),
        namespaceAndName.getName(),
        result.getRequestedRevision(),
        fileObject.getPath()
      )
    );
  }
}
