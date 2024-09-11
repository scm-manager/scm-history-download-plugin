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

import React, { FC } from "react";
import { Icon, NoStyleButton } from "@scm-manager/ui-components";
import { extensionPoints } from "@scm-manager/ui-extensions";
import { useFileTreeContext } from "./context";
import {useTranslation} from "react-i18next";

const SelectFileLink: FC<extensionPoints.ReposSourcesTreeRowProps> = ({ file }) => {
  const [t] = useTranslation("plugins");
  const { select, unselect, selectedFile } = useFileTreeContext();

  const handleClick = () => {
    if (file === selectedFile?.file) {
      unselect();
    } else {
      select(file);
    }
  };

  return (
    <NoStyleButton title={t("scm-history-download-plugin.link.title")} onClick={handleClick}>
      <Icon name="history" color="link" />
    </NoStyleButton>
  );
};

export default SelectFileLink;
