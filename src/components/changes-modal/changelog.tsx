/**
 Copyright Findie 2021
 */
import React, {useEffect, useState} from "react";
import * as css from './styles.css'
import {eventList} from "../../helpers/events";
import {Link} from "@material-ui/core";
import classNames from "classnames";

declare global {
  interface Window {
    Headway: any,
  }
}

async function headwayReady() {
  for (let i = 0; i < 10; i++) {
    console.log('checking headway...', i);
    if (window.Headway) {
      console.log('found headway!');
      console.log('will return true')
      return true;
    } else {
      console.log('headway not found...');
      await new Promise(_ => setTimeout(_, 1000));
    }
  }
  return false;
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

  for (let i = 0; i < 3; i++) {
    try {
      const hw = window.Headway.init(config);
      console.log('headway inited',hw);
      return hw;
    } catch (e) {
      console.error(e);
      await new Promise(_ => setTimeout(_, 500));
    }
  }
  return null;
}

export function Changelog() {

  const [isLoaded, setIsLoaded] = useState(false);
  const [isInited, setIsInited] = useState(false);

  useEffect(() => {
    headwayReady()
      .then((found) => {
        console.log('headway found', found);
        setIsLoaded(found);
        if (found) {
          return initHeadway();
        }
        return null;
      })
      .then(headway => setIsInited(!!headway))
      .catch(console.error);
  }, [setIsLoaded, setIsInited]);

  return (
    <Link
      className={classNames(css.text, (!isLoaded || !isInited) && css.hidden)}
    >
      View latest changes
    </Link>
  )

}
