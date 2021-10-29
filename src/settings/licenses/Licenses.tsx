import React, {useState} from 'react'
import {licenses} from "./licenses";
import {Collapse, IconButton, Link, Typography} from "@material-ui/core";
import {shell} from "@electron/remote";
import {CodeDisplay} from "../../components/code";
import Add from "@material-ui/icons/Add";
import Remove from "@material-ui/icons/Remove";


function License(props: { license: typeof licenses[number] }) {
  const { license } = props;

  const collapsable = !!license.fileLicense;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Collapse in={collapsed} collapsedHeight={48}>
      <Typography variant="h6" style={{ whiteSpace: 'nowrap' }}>
        <IconButton
          onClick={() => setCollapsed(c => !c)}
          disabled={!collapsable}
          style={{ opacity: collapsable ? 1 : 0 }}
        >
          {!collapsed ? <Add/> : <Remove/>}
        </IconButton>
        <Link
          style={{ textDecorationLine: 'underline' }}
          onClick={() => shell.openExternal(license.repo)}>
          {license.name}
        </Link>{' '}
        v{license.version} : {license.license}{' '}
        {license.external && (
          <>
            {' | '}
            <Link
              style={{ textDecorationLine: 'underline' }}
              onClick={() => shell.openExternal(license.binaries)}
            >
              Binaries here
            </Link>
          </>
        )}
      </Typography>

      <CodeDisplay style={{ marginLeft: -24, marginRight: -24 }}>
        {license.fileLicense}
      </CodeDisplay>
    </Collapse>
  )
}

export function Licenses(props: { type: 'external' | 'bundled', title: string }) {

  const l = licenses.filter(x => {
    if (props.type === 'external') {
      return !!x.external;
    }
    if (props.type === 'bundled') {
      return !x.external;
    }
  });

  return (
    <>
      <Typography variant="h6">{props.title}</Typography>

      {l.map((license, i) => <License key={i} license={license}/>)}
    </>
  )
}
