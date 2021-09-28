/*
 * MIT License
 *
 * Copyright (c) 2020-present Cloudogu GmbH and Contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
