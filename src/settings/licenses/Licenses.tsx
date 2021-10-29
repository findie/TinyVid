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
      <Typography variant="h6" style={{whiteSpace: 'nowrap'}}>
        <IconButton
          onClick={() => setCollapsed(c => !c)}
          disabled={!collapsable}
          style={{opacity: collapsable ? 1 : 0}}
        >
          {!collapsed ? <Add/> : <Remove/>}
        </IconButton>
        <Link onClick={() => shell.openExternal(license.repo)}>{license.name}</Link>{' '}
        v{license.version} : {license.license}
      </Typography>

      <CodeDisplay style={{marginLeft: -24, marginRight: -24}}>
        {license.fileLicense}
      </CodeDisplay>
    </Collapse>
  )
}

export function Licenses() {

  return (
    <>
      <Typography variant="h6">3rd party licenses</Typography>

      {licenses.map((license, i) => <License key={i} license={license}/>)}
    </>
  )
}
