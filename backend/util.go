package main

import "encoding/json"

// Returns -1 if not found, otherwise index.
func containsString(arg string, array []string) int {
	for ct, x := range array {
		if x == arg {
			return ct
		}
	}

	return -1
}

func jsonEscape(i string) string {
	b, err := json.Marshal(i)
	if err != nil {
		panic(err)
	}
	s := string(b)
	return s[1 : len(s)-1]
}
