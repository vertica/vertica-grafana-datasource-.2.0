package main

// Copyright (c) 2019 Micro Focus or one of its affiliates.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import (
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/grafana/grafana_plugin_model/go/datasource"
	hclog "github.com/hashicorp/go-hclog"

)

const macroPattern = `\$(__[_a-zA-Z0-9]+)\(([^\)]*)\)`

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
	case "__timeFrom":
		if len(args) != 0 {
			return "", fmt.Errorf("macro %v should have no arguments", name)
		}
		return fmt.Sprintf("'%s'",
				time.Unix(0, timeRange.GetFromEpochMs()*1000000).Format(time.RFC3339Nano)),
			nil
	case "__timeTo":
		if len(args) != 0 {
			return "", fmt.Errorf("macro %v should have no arguments", name)
		}
		return fmt.Sprintf("'%s'",
				time.Unix(0, timeRange.GetToEpochMs()*1000000).Format(time.RFC3339Nano)),
			nil
	case "__expandMultiString":
		if len(args) == 0 {
			return "", fmt.Errorf("missing selector argument for macro: %v", name)
		}

		var result string

		for ct := 0; ct < len(args); ct++ {
			trimmed := strings.Trim(args[ct], "{}'")
			if ct > 0 {
				result += fmt.Sprintf(",'%s'", trimmed)
			} else {
				result += fmt.Sprintf("'%s'", trimmed)
			}
		}

		return result, nil
	case "__unixEpochFilter":
		if len(args) == 0 {
			return "", fmt.Errorf("missing time column argument for macro %v", name)
		}
		return fmt.Sprintf("%s >= %d AND %s <= %d", args[0], timeRange.GetFromEpochMs(), args[0], timeRange.GetToEpochMs()), nil
	default:
		return "", fmt.Errorf("undefined macro: $__%v", name)
	}
}

func replaceAllStringSubmatchFunc(re *regexp.Regexp, str string, repl func([]string) (string, error)) (string, error) {
	result := ""
	lastIndex := 0

	for _, v := range re.FindAllSubmatchIndex([]byte(str), -1) {
		groups := []string{}
		for i := 0; i < len(v); i += 2 {
			groups = append(groups, str[v[i]:v[i+1]])
		}

		replacement, err := repl(groups)

		if err != nil {
			return "", err
		}

		result += str[lastIndex:v[0]] + replacement

		lastIndex = v[1]
	}

	return result + str[lastIndex:], nil
}

func sanitizeAndInterpolateMacros(aLogger hclog.Logger, rawSQL string, tsdbReq *datasource.DatasourceRequest) (string, error) {

	regex, err := regexp.Compile(macroPattern)

	if err != nil {
		aLogger.Error(err.Error())
		return rawSQL, err
	}

	sql, err := replaceAllStringSubmatchFunc(regex, rawSQL, func(groups []string) (string, error) {

		var args []string

		if len(groups) > 2 && len(groups[2]) > 0 {
			args = strings.Split(groups[2], ",")
			for i, arg := range args {
				args[i] = strings.Trim(arg, " ")
			}
		}

		res, err := evaluateMacro(groups[1], args, tsdbReq.GetTimeRange())

		if err != nil {
			return "", err
		}

		return res, nil
	})

	return sql, err
}
