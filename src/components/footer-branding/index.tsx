import React from "react";
import * as css from './style.css';
import {Link} from "@material-ui/core";
import {Favorite} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";
import {Theme} from "../../helpers/theme";
import {Kamua} from "./kamua";

const styles = makeStyles({
  'root': {
    ...Theme.current().typography.body1
  }
})

export function FooterBranding() {
  const classes = styles();

  return (
    <div className={css.main + ' ' + classes}>
      <div className={css.left}>
        <Link
          href={'https://github.com/legraphista/QuickTrim/issues/new?assignees=legraphista&labels=enhancement&template=feature_request.md&title='}
          target={'_blank'}>
          Request a feature
        </Link>
        &nbsp;|&nbsp;
        <Link
          href={'https://github.com/legraphista/QuickTrim/issues/new?assignees=legraphista&labels=enhancement&template=feature_request.md&title='}
          target={'_blank'}>
          Submit an issue
        </Link>
      </div>

      <Link
        className={css.right}
        href={'https://kamua.com'}
        target={'_blank'}
      >
        Made with
        <Favorite color={"error"} className={css.heart}/>
        by

        <Kamua className={css.kamua}/>
      </Link>
    </div>
  );
}