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

import React from "react";
import { binder, extensionPoints } from "@scm-manager/ui-extensions";

import Provider from "./context"
import SelectFileLink from "./SelectFileLink";
import FileHistory from "./FileHistory";

binder.bind<extensionPoints.ReposSourcesTreeWrapperExtension>("repos.source.tree.wrapper", Provider);
binder.bind<extensionPoints.ReposSourcesTreeRowRightExtension>("repos.sources.tree.row.right", SelectFileLink);
binder.bind<extensionPoints.ReposSourcesTreeRowAfterExtension>("repos.sources.tree.row.after", FileHistory);
