
/**
 * @testCase
 * const a = ref(1)
 * a.value === 1
 * a.value = 2
 * a.value === 2
 */

 export function ref(raw: any) {
   return {
     value: raw
   };
 }