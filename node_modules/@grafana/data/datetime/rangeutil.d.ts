/// <reference types="lodash" />
import { RawTimeRange, TimeRange, TimeZone, IntervalValues } from '../types/time';
export declare function getRelativeTimesList(timepickerSettings: any, currentDisplay: any): import("lodash").Dictionary<(number | {
    from: string;
    to: string;
    display: string;
    section: number;
} | (() => string) | (() => string) | (() => {
    from: string;
    to: string;
    display: string;
    section: number;
} | undefined) | ((...items: {
    from: string;
    to: string;
    display: string;
    section: number;
}[]) => number) | {
    (...items: ConcatArray<{
        from: string;
        to: string;
        display: string;
        section: number;
    }>[]): {
        from: string;
        to: string;
        display: string;
        section: number;
    }[];
    (...items: ({
        from: string;
        to: string;
        display: string;
        section: number;
    } | ConcatArray<{
        from: string;
        to: string;
        display: string;
        section: number;
    }>)[]): {
        from: string;
        to: string;
        display: string;
        section: number;
    }[];
} | ((separator?: string | undefined) => string) | (() => {
    from: string;
    to: string;
    display: string;
    section: number;
}[]) | (() => {
    from: string;
    to: string;
    display: string;
    section: number;
} | undefined) | ((start?: number | undefined, end?: number | undefined) => {
    from: string;
    to: string;
    display: string;
    section: number;
}[]) | ((compareFn?: ((a: {
    from: string;
    to: string;
    display: string;
    section: number;
}, b: {
    from: string;
    to: string;
    display: string;
    section: number;
}) => number) | undefined) => {
    from: string;
    to: string;
    display: string;
    section: number;
}[]) | {
    (start: number, deleteCount?: number | undefined): {
        from: string;
        to: string;
        display: string;
        section: number;
    }[];
    (start: number, deleteCount: number, ...items: {
        from: string;
        to: string;
        display: string;
        section: number;
    }[]): {
        from: string;
        to: string;
        display: string;
        section: number;
    }[];
} | ((...items: {
    from: string;
    to: string;
    display: string;
    section: number;
}[]) => number) | ((searchElement: {
    from: string;
    to: string;
    display: string;
    section: number;
}, fromIndex?: number | undefined) => number) | ((searchElement: {
    from: string;
    to: string;
    display: string;
    section: number;
}, fromIndex?: number | undefined) => number) | {
    <S extends {
        from: string;
        to: string;
        display: string;
        section: number;
    }>(predicate: (value: {
        from: string;
        to: string;
        display: string;
        section: number;
    }, index: number, array: {
        from: string;
        to: string;
        display: string;
        section: number;
    }[]) => value is S, thisArg?: any): this is S[];
    (predicate: (value: {
        from: string;
        to: string;
        display: string;
        section: number;
    }, index: number, array: {
        from: string;
        to: string;
        display: string;
        section: number;
    }[]) => unknown, thisArg?: any): boolean;
} | ((predicate: (value: {
    from: string;
    to: string;
    display: string;
    section: number;
}, index: number, array: {
    from: string;
    to: string;
    display: string;
    section: number;
}[]) => unknown, thisArg?: any) => boolean) | ((callbackfn: (value: {
    from: string;
    to: string;
    display: string;
    section: number;
}, index: number, array: {
    from: string;
    to: string;
    display: string;
    section: number;
}[]) => void, thisArg?: any) => void) | (<U>(callbackfn: (value: {
    from: string;
    to: string;
    display: string;
    section: number;
}, index: number, array: {
    from: string;
    to: string;
    display: string;
    section: number;
}[]) => U, thisArg?: any) => U[]) | {
    <S_1 extends {
        from: string;
        to: string;
        display: string;
        section: number;
    }>(predicate: (value: {
        from: string;
        to: string;
        display: string;
        section: number;
    }, index: number, array: {
        from: string;
        to: string;
        display: string;
        section: number;
    }[]) => value is S_1, thisArg?: any): S_1[];
    (predicate: (value: {
        from: string;
        to: string;
        display: string;
        section: number;
    }, index: number, array: {
        from: string;
        to: string;
        display: string;
        section: number;
    }[]) => unknown, thisArg?: any): {
        from: string;
        to: string;
        display: string;
        section: number;
    }[];
} | {
    (callbackfn: (previousValue: {
        from: string;
        to: string;
        display: string;
        section: number;
    }, currentValue: {
        from: string;
        to: string;
        display: string;
        section: number;
    }, currentIndex: number, array: {
        from: string;
        to: string;
        display: string;
        section: number;
    }[]) => {
        from: string;
        to: string;
        display: string;
        section: number;
    }): {
        from: string;
        to: string;
        display: string;
        section: number;
    };
    (callbackfn: (previousValue: {
        from: string;
        to: string;
        display: string;
        section: number;
    }, currentValue: {
        from: string;
        to: string;
        display: string;
        section: number;
    }, currentIndex: number, array: {
        from: string;
        to: string;
        display: string;
        section: number;
    }[]) => {
        from: string;
        to: string;
        display: string;
        section: number;
    }, initialValue: {
        from: string;
        to: string;
        display: string;
        section: number;
    }): {
        from: string;
        to: string;
        display: string;
        section: number;
    };
    <U_1>(callbackfn: (previousValue: U_1, currentValue: {
        from: string;
        to: string;
        display: string;
        section: number;
    }, currentIndex: number, array: {
        from: string;
        to: string;
        display: string;
        section: number;
    }[]) => U_1, initialValue: U_1): U_1;
} | {
    (callbackfn: (previousValue: {
        from: string;
        to: string;
        display: string;
        section: number;
    }, currentValue: {
        from: string;
        to: string;
        display: string;
        section: number;
    }, currentIndex: number, array: {
        from: string;
        to: string;
        display: string;
        section: number;
    }[]) => {
        from: string;
        to: string;
        display: string;
        section: number;
    }): {
        from: string;
        to: string;
        display: string;
        section: number;
    };
    (callbackfn: (previousValue: {
        from: string;
        to: string;
        display: string;
        section: number;
    }, currentValue: {
        from: string;
        to: string;
        display: string;
        section: number;
    }, currentIndex: number, array: {
        from: string;
        to: string;
        display: string;
        section: number;
    }[]) => {
        from: string;
        to: string;
        display: string;
        section: number;
    }, initialValue: {
        from: string;
        to: string;
        display: string;
        section: number;
    }): {
        from: string;
        to: string;
        display: string;
        section: number;
    };
    <U_2>(callbackfn: (previousValue: U_2, currentValue: {
        from: string;
        to: string;
        display: string;
        section: number;
    }, currentIndex: number, array: {
        from: string;
        to: string;
        display: string;
        section: number;
    }[]) => U_2, initialValue: U_2): U_2;
} | {
    <S_2 extends {
        from: string;
        to: string;
        display: string;
        section: number;
    }>(predicate: (this: void, value: {
        from: string;
        to: string;
        display: string;
        section: number;
    }, index: number, obj: {
        from: string;
        to: string;
        display: string;
        section: number;
    }[]) => value is S_2, thisArg?: any): S_2 | undefined;
    (predicate: (value: {
        from: string;
        to: string;
        display: string;
        section: number;
    }, index: number, obj: {
        from: string;
        to: string;
        display: string;
        section: number;
    }[]) => unknown, thisArg?: any): {
        from: string;
        to: string;
        display: string;
        section: number;
    } | undefined;
} | ((predicate: (value: {
    from: string;
    to: string;
    display: string;
    section: number;
}, index: number, obj: {
    from: string;
    to: string;
    display: string;
    section: number;
}[]) => unknown, thisArg?: any) => number) | ((value: {
    from: string;
    to: string;
    display: string;
    section: number;
}, start?: number | undefined, end?: number | undefined) => {
    from: string;
    to: string;
    display: string;
    section: number;
}[]) | ((target: number, start: number, end?: number | undefined) => {
    from: string;
    to: string;
    display: string;
    section: number;
}[]) | (() => IterableIterator<[number, {
    from: string;
    to: string;
    display: string;
    section: number;
}]>) | (() => IterableIterator<number>) | (() => IterableIterator<{
    from: string;
    to: string;
    display: string;
    section: number;
}>) | ((searchElement: {
    from: string;
    to: string;
    display: string;
    section: number;
}, fromIndex?: number | undefined) => boolean) | (<U_3, This = undefined>(callback: (this: This, value: {
    from: string;
    to: string;
    display: string;
    section: number;
}, index: number, array: {
    from: string;
    to: string;
    display: string;
    section: number;
}[]) => U_3 | readonly U_3[], thisArg?: This | undefined) => U_3[]) | (<A, D extends number = 1>(this: A, depth?: D | undefined) => FlatArray<A, D>[]))[]>;
export declare function describeTextRange(expr: any): any;
/**
 * Use this function to get a properly formatted string representation of a {@link @grafana/data:RawTimeRange | range}.
 *
 * @example
 * ```
 * // Prints "2":
 * console.log(add(1,1));
 * ```
 * @category TimeUtils
 * @param range - a time range (usually specified by the TimePicker)
 * @alpha
 */
export declare function describeTimeRange(range: RawTimeRange, timeZone?: TimeZone): string;
export declare const isValidTimeSpan: (value: string) => boolean;
export declare const describeTimeRangeAbbreviation: (range: TimeRange, timeZone?: string | undefined) => string;
export declare const convertRawToRange: (raw: RawTimeRange, timeZone?: string | undefined) => TimeRange;
export declare function isRelativeTimeRange(raw: RawTimeRange): boolean;
export declare function secondsToHms(seconds: number): string;
export declare function calculateInterval(range: TimeRange, resolution: number, lowLimitInterval?: string): IntervalValues;
export declare function describeInterval(str: string): {
    sec: number;
    type: string;
    count: number;
};
export declare function intervalToSeconds(str: string): number;
export declare function intervalToMs(str: string): number;
export declare function roundInterval(interval: number): 10 | 1000 | 20 | 50 | 100 | 200 | 500 | 2000 | 5000 | 10000 | 15000 | 20000 | 30000 | 60000 | 120000 | 300000 | 600000 | 900000 | 1200000 | 1800000 | 3600000 | 7200000 | 10800000 | 21600000 | 43200000 | 86400000 | 604800000 | 2592000000 | 31536000000;
