import {createMuiTheme, Theme as MUITheme} from "@material-ui/core";

export namespace Theme {

   const darkTheme = createMuiTheme({
    palette: {
      type: 'dark',
    },
  });

  export const current = darkTheme;

  window.theme = darkTheme;

  console.log(darkTheme);
}

declare global {
  interface Window {
    theme: MUITheme
  }
}