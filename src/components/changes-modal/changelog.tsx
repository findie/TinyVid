/**
 Copyright Findie 2021
 */
import React, {useEffect} from "react";
import * as css from './styles.css'
import {eventList} from "../../helpers/events";
import {Link} from "@material-ui/core";

declare global {
  interface Window {
    Headway: any,
  }
}


export function Changelog() {

  useEffect(() => {
    const config = {
      selector: `.${css.text}`,
      account: "x8AnL7",
      callbacks: {
        onShowWidget: function () {
          eventList.global.viewChanges();
        },
      },
      translations: {
        title: "Latest Changes",
        readMore: "Read more",
        labels: {
          "new": "New",
          "improvement": "Updates",
          "fix": "Fixes"
        },
        footer: "Read more 👉"
      }
    };

    console.log('initting headway with', config)
    window.Headway.init(config);

  }, []);

  return (
    <Link className={css.text}>
      View latest changes
    </Link>
  )

}
