# cf-sps-calls
Tool to extract information related to stored procedure calls in a ColdFusion application.

## Output
The output is a CSV  file with the following format:
```
filename, sp_name, parameter, datasource, line
```
## Use mode
1. Execute index.js and pass the path to the ColdFusion application source code:
node index.js ./my_app

## Internals
* This tool is parsing CFML code using a modified version of [htmlparser2][1], check [cfml-parser.js][2] and [cfml-handler.js][3]
* CFScript code is not supported at this time.

<!-- links -->
[1]: https://www.npmjs.com/package/htmlparser2
[2]: https://github.com/ORC-RIS/cf-sps-calls/blob/master/lib/cfml-parser/cfml-parser.js
[3]: https://github.com/ORC-RIS/cf-sps-calls/blob/master/lib/cfml-parser/cfml-handler.js
