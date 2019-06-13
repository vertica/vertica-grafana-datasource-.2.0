package main

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/grafana/grafana_plugin_model/go/datasource"
)

const macroPattern = `\$(__[_a-zA-Z0-9]+)\(([^\)]*)\)`

func replaceAllStringSubmatchFunc(re *regexp.Regexp, str string, repl func([]string) string) string {
	result := ""
	lastIndex := 0

	for _, v := range re.FindAllSubmatchIndex([]byte(str), -1) {
		groups := []string{}
		for i := 0; i < len(v); i += 2 {
			groups = append(groups, str[v[i]:v[i+1]])
		}

		result += str[lastIndex:v[0]] + repl(groups)
		lastIndex = v[1]
	}

	return result + str[lastIndex:]
}

func evaluateMacro(name string, args []string, timeRange *datasource.TimeRange) (string, error) {
	switch name {
	case "__time":
		if len(args) == 0 {
			return "", fmt.Errorf("missing time column argument for macro %v", name)
		}
		return fmt.Sprintf("%s AS \"time\"", args[0]), nil
	// case "__timeFilter":
	// 	if len(args) == 0 {
	// 		return "", fmt.Errorf("missing time column argument for macro %v", name)
	// 	}
	// 	return fmt.Sprintf("%s BETWEEN '%s' AND '%s'",
	// 			args[0],
	// 			timeRange.GetFromAsTimeUTC().Format(time.RFC3339Nano),
	// 			timeRange.GetToAsTimeUTC().Format(time.RFC3339Nano)),
	// 		nil
	default:
		return "", fmt.Errorf("Unknown macro %v", name)
	}
}

func interpolateMacros(rawSQL string, tsdbReq *datasource.DatasourceRequest) (string, error) {

	regex, _ := regexp.Compile(macroPattern)

	sql := replaceAllStringSubmatchFunc(regex, rawSQL, func(groups []string) string {

		args := strings.Split(groups[2], ",")
		for i, arg := range args {
			args[i] = strings.Trim(arg, " ")
		}
		res, _ := evaluateMacro(groups[1], args, tsdbReq.GetTimeRange())
		// if err != nil && macroError == nil {
		// 	macroError = err
		// 	return "macro_error()"
		// }
		return res
	})

	return sql, nil
}
