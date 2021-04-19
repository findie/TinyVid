/**
 Copyright Findie 2021
 */
import React from "react";
import * as css from './styles.css'
import {eventList} from "../../helpers/events";
import {Link} from "@material-ui/core";
import classNames from "classnames";
import {remote} from "electron";

export function Changelog() {

  return (
    <Link
      className={classNames(css.text)}
      onClick={() => {
        remote.shell.openExternal('https://headwayapp.co/tinyvid-changelog').catch(console.error);
        eventList.global.viewChanges();
      }}
    >
      View latest changes
    </Link>
  )

}
