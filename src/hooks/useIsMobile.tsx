@@ .. @@
-import * as React from "react"
+import { useState, useEffect } from "react"
 
 const MOBILE_BREAKPOINT = 768
 
 export function useIsMobile() {
-  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)
+  const [isMobile, setIsMobile] = useState<boolean>(false)
+  const [isInitialized, setIsInitialized] = useState<boolean>(false)
 
-  React.useEffect(() => {
-    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
-    const onChange = () => {
-      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
+  useEffect(() => {
+    // Check if window is available (for SSR compatibility)
+    if (typeof window === 'undefined') return;
+    
+    // Initial check
+    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
+    setIsInitialized(true)
+    
+    // Set up media query listener
+    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
+    
+    const handleResize = (e: MediaQueryListEvent) => {
+      setIsMobile(e.matches)
     }
-    mql.addEventListener("change", onChange)
-    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
-    return () => mql.removeEventListener("change", onChange)
+    
+    // Modern event listener
+    mediaQuery.addEventListener('change', handleResize)
+    
+    return () => {
+      mediaQuery.removeEventListener('change', handleResize)
+    }
   }, [])
 
-  return !!isMobile
+  return isInitialized ? isMobile : false
 }