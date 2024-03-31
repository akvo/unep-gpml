((clojure-mode
  (eval . (put-clojure-indent 'saga 2))
  (eval . (put-clojure-indent 'logging-if-false 2))
  (eval . (put-clojure-indent 'with-constraint-violation-check 1))
  (eval . (put-clojure-indent 'metrics 2)))
 (nil . ((cider-ns-refresh-before-fn . "integrant.repl/suspend")
         (cider-ns-refresh-after-fn  . "integrant.repl/resume")
         (cider-log-framework-name . "Timbre")
	       (eval . (customize-set-variable 'cider-path-translations
					                               (let ((m2 (concat (getenv "HOME") "/.m2")))
					                                 (list
					                                  (cons "/app" (clojure-project-dir))
					                                  (cons "/home/akvo/.m2" m2)
					                                  (cons "/root/.m2" m2))))))))
