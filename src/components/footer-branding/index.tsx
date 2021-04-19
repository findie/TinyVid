import React from "react";
import * as css from './style.css';
import {Link} from "@material-ui/core";
import Favorite from "@material-ui/icons/Favorite";
import {makeStyles} from "@material-ui/core/styles";
import {Kamua} from "./kamua";

const styles = makeStyles(theme => ({
  'root': {
    ...theme.typography.body1
  }
}));

export type FooterBrandingProps = {
  children?: React.ReactNode
}


export function FooterBranding({ children }: FooterBrandingProps) {
  const classes = styles();

  return (
    <div className={css.main + ' ' + classes.root}>
      <div className={css.left}>
        {/*<Link*/}
        {/*  href={'https://github.com/legraphista/QuickTrim/issues/new?assignees=legraphista&labels=enhancement&template=feature_request.md&title='}*/}
        {/*  target={'_blank'}>*/}
        {/*  Request a feature*/}
        {/*</Link>*/}
        {/*&nbsp;|&nbsp;*/}
        {/*<Link*/}
        {/*  href={'https://github.com/legraphista/QuickTrim/issues/new?assignees=legraphista&labels=enhancement&template=feature_request.md&title='}*/}
        {/*  target={'_blank'}>*/}
        {/*  Submit an issue*/}
        {/*</Link>*/}
        {children}
      </div>

      <Link
        className={css.right}
        href={'https://kamua.com/?utm_source=TinyVid&utm_medium=footer'}
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
