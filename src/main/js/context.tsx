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

import React, { FC, useContext, useState } from "react";
import {File, Repository} from "@scm-manager/ui-types";
import { extensionPoints } from "@scm-manager/ui-extensions";

type SelectFile = (file: File) => void;
type UnselectFile = () => void;

export type SelectedFile = {
  repository: Repository;
  revision: string;
  file: File;
}

type FileTreeContext = {
  selectedFile?: SelectedFile;
  select: SelectFile;
  unselect: UnselectFile;
};

const defaultContext: FileTreeContext = {
  select: () => {},
  unselect: () => {}
};

const Context = React.createContext(defaultContext);

export const useFileTreeContext = () => {
  return useContext(Context);
};

const Provider: FC<extensionPoints.ReposSourcesTreeWrapperProps> = ({ repository, revision, children }) => {
  const [selectedFile, setSelectedFile] = useState<SelectedFile>();

  const select = (file: File) => {
    setSelectedFile({
      repository,
      revision,
      file
    })
  };

  const unselect = () => {
    setSelectedFile(undefined)
  };

  const ctx: FileTreeContext = { selectedFile, select, unselect };
  return <Context.Provider value={ctx}>{children}</Context.Provider>;
};

export default Provider;
