function chunk(a: Int16Array, n: number): Int16Array[] {
    if (n <= 0) throw `Invalid chunk size: ${n}`
    let r: Int16Array[] =  [];
    let l: number = a.byteLength;
    for(let i = 0; i < l; i++)
        r.push(a.slice(i, i+n));
    return r;
}

function levenshtein_distance(a: Int16Array, b: Int16Array): number {
    let n: number = a.length;       // Lenght of array a
    let m: number = b.length;       // Length of array b
    let dc: number = 0;             // The cost to delete
    let ic: number = 0;             // The cost to insert
    let sc: number = 0;             // The cost to substitute
    let d0 = new Int16Array(m+1);   // Distance array row 0
    let d1 = new Int16Array(m+1);   // Distance array row 1

    // No need to calculate distance if one of the arrays are empty
    if(n == 0 || m == 0)
        return Number.MAX_VALUE;

    // Populate row 0 with the distance the index of charaters in a
    for(let i = 0; i <= n; i++)
        d0[i] = i;
    
    for(let i = 0; i < m; i++){
        // First element of row 1 is equivilant to element i + 1 in the initial row 0.
        d1[0] = i + 1;

        for(let j = 0; j < n; j++){
            dc = d0[j + 1] + 1;
            ic = d1[j] + 1;
            sc = a[i] == b[j] ? d0[j] : d0[j] + 1;
            d1[j + 1] = Math.min(dc, ic, sc);
        }
        // Swap current row and previous row
        [d0, d1] = [d1, d0];
    }

    return d0[n]
}

function text_to_array(s: string): Int16Array {
    const array = new Int16Array(s.length);
    for(let i = 0; i < s.length; i++)
        array[i] = s.charCodeAt(i);
    return array;
}

function search(a: Int16Array, b: Int16Array) {
    let c: Int16Array[] = chunk(b, a.length);
    let s: number = Number.MAX_VALUE;
    for(let j = 0; j < c.length; j++){   
        let t: number = levenshtein_distance(a, c[j]);
        s = s > t ? t : s;
    }
    return s;
}

export {
    text_to_array,
    search
}