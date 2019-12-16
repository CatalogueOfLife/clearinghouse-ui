
import config from '../../../config'

const {kibanaEnv} = config;
const kibanaQuery = (sectorKey, attempt) => !isNaN(attempt) ? `https://logs.gbif.org/app/kibana#/discover?_g=(refreshInterval:(display:On,pause:!f,value:0),time:(from:now-4h,mode:quick,to:now))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${kibanaEnv.index},key:sector,negate:!f,type:phrase,value:${sectorKey}),query:(match:(sector:(query:${sectorKey},type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${kibanaEnv.index},key:attempt,negate:!f,type:phrase,value:${attempt}),query:(match:(attempt:(query:${attempt},type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${kibanaEnv.index},key:environment,negate:!f,type:phrase,value:${kibanaEnv.name}),query:(match:(environment:(query:${kibanaEnv.name},type:phrase))))),index:${kibanaEnv.index},interval:auto,query:(match_all:()),sort:!('@timestamp',desc))` :
`https://logs.gbif.org/app/kibana#/discover?_g=(refreshInterval:(display:On,pause:!f,value:0),time:(from:now-4h,mode:quick,to:now))&_a=(columns:!(_source),filters:!(('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${kibanaEnv.index},key:sector,negate:!f,type:phrase,value:${sectorKey}),query:(match:(sector:(query:${sectorKey},type:phrase)))),('$state':(store:appState),meta:(alias:!n,disabled:!f,index:${kibanaEnv.index},key:environment,negate:!f,type:phrase,value:${kibanaEnv.name}),query:(match:(environment:(query:${kibanaEnv.name},type:phrase))))),index:${kibanaEnv.index},interval:auto,query:(match_all:()),sort:!('@timestamp',desc))`
export default kibanaQuery