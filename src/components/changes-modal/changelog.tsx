/**
 Copyright Findie 2021
 */
import React, {useEffect, useState} from "react";
import * as css from './styles.css'
import {eventList} from "../../helpers/events";
import {Link} from "@material-ui/core";

declare global {
  interface Window {
    Headway: any,
  }
}

async function initHeadway() {
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

  console.log('initting headway with', config);

  let inited = false;

  for (let i = 0; i < 10; i++) {
    if (window.Headway) {
      try {
        window.Headway.init(config);
        inited = true;
        break;
      } catch (e) {
        console.error(e);
        await new Promise(_ => setTimeout(_, 1000));
      }
    } else {
      await new Promise(_ => setTimeout(_, 1000));
    }
  }

  return inited;
}

export function Changelog() {

  const [isInited, setIsInited] = useState(false);

  useEffect(() => {
    initHeadway().then(setIsInited).catch(console.error);
  }, [setIsInited]);

  if (!isInited) return null;

  return (
    <Link className={css.text}>
      View latest changes
    </Link>
  )

}
