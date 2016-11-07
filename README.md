# cf-sps-calls
Tool to extract information for stored procedure calls in a ColdFusion application.

## Note
* Generates a CSV file 

| filename | sp_name | parameter | datasource | line |

## Internals
* This tools is parsing CFML code using a modified version of [htmlparser2], check [cfml-parser.js] and [cfml-handler.js]
* CFScript code is not supported at this time.


## Use mode
1. Initialize a directory: `node cf-code-metrics init`
2. Define GitHub repository path and application URL
3. Generate documentation:: `node cf-code-metrics`
