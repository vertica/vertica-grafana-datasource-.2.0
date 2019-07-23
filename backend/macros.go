package main

import (
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/grafana/grafana_plugin_model/go/datasource"
	hclog "github.com/hashicorp/go-hclog"
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
		return fmt.Sprintf("%s AS time", args[0]), nil
	case "__timeFilter":
		if len(args) == 0 {
			return "", fmt.Errorf("missing time column argument for macro %v", name)
		}
		return fmt.Sprintf("%s BETWEEN '%s' AND '%s'",
				args[0],
				time.Unix(0, timeRange.GetFromEpochMs()*1000000).Format(time.RFC3339Nano),
				time.Unix(0, timeRange.GetToEpochMs()*1000000).Format(time.RFC3339Nano)),
			nil
	case "__expandMultiString":
		if len(args) == 0 {
			return "", fmt.Errorf("missing string argument for macro: %v", name)
		}

		var result string

		if len(args) == 1 {
			return args[0], nil
		}

		for ct := 0; ct < len(args)-1; ct++ {
			trimmed := strings.Trim(args[ct], "{}'")
			if ct > 0 {
				result += fmt.Sprintf(",'%s'", trimmed)
			} else {
				result += fmt.Sprintf("'%s'", trimmed)
			}
		}

		return result, nil

	default:
		return "", fmt.Errorf("Unknown macro %v", name)
	}
}

func sanitizeAndInterpolateMacros(aLogger hclog.Logger, rawSQL string, tsdbReq *datasource.DatasourceRequest) (string, error) {

	regex, err := regexp.Compile(macroPattern)

	if err != nil {
		aLogger.Error(err.Error())
		return rawSQL, err
	}

	// Replace macros
	// TODO: propagate errors
	sql := replaceAllStringSubmatchFunc(regex, rawSQL, func(groups []string) string {

		args := strings.Split(groups[2], ",")
		for i, arg := range args {
			args[i] = strings.Trim(arg, " ")
		}
		res, err := evaluateMacro(groups[1], args, tsdbReq.GetTimeRange())

		if err != nil {
			aLogger.Error(err.Error())
			return "macro_error()"
		}

		return res
	})

	return sql, nil
}
