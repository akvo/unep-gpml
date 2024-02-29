(ns gpml.handler.responses
  "Borrowed from https://gist.github.com/mtnygard/9e6a3c5a107eed02f7616393cbb124b7 -
   Michael Nygard")

(defn- response [status body]
  {:status  status
   :headers {}
   :body    body})

(defmacro def-http-status
  {:style/indent 1}
  [code sym]
  `(def ~sym (fn [~'body]
               (response ~code ~'body))))

(def-http-status 200 ok)
(def-http-status 201 created)
(def-http-status 202 accepted)
(def-http-status 204 no-content)
(def-http-status 205 reset-content)
(def-http-status 206 partial-content)
(def-http-status 207 multi-status)
(def-http-status 208 already-reported)
(def-http-status 226 im-used)
(def-http-status 300 multiple-choices)
(def-http-status 301 moved-permanently)
(def-http-status 302 found)
(def-http-status 303 see-other)
(def-http-status 304 not-modified)
(def-http-status 305 use-proxy)
(def-http-status 306 switch-proxy)
(def-http-status 307 temporary-redirect)
(def-http-status 308 permanent-redirect)
(def-http-status 400 bad-request)
(def-http-status 401 unauthorized)
(def-http-status 402 payment-required)
(def-http-status 403 forbidden)
(def-http-status 404 not-found)
(def-http-status 405 method-not-allowed)
(def-http-status 406 not-acceptable)
(def-http-status 407 proxy-authentication-required)
(def-http-status 408 request-timeout)
(def-http-status 409 conflict)
(def-http-status 410 gone)
(def-http-status 411 length-required)
(def-http-status 412 precondition-failed)
(def-http-status 413 payload-too-large)
(def-http-status 414 uri-too-long)
(def-http-status 415 unsupported-media-type)
(def-http-status 416 range-not-satisfiable)
(def-http-status 417 expectation-failed)
(def-http-status 418 im-a-teapot)
(def-http-status 421 misdirected-request)
(def-http-status 422 unprocessable-entity)
(def-http-status 423 locked)
(def-http-status 424 failed-dependency)
(def-http-status 425 too-early)
(def-http-status 426 upgrade-required)
(def-http-status 428 precondition-required)
(def-http-status 429 too-many-requests)
(def-http-status 431 header-fields-too-large)
(def-http-status 451 unavailable-for-legal-reasons)
(def-http-status 500 server-error)
(def-http-status 501 not-implemented)
(def-http-status 502 bad-gateway)
(def-http-status 503 service-unavailable)
(def-http-status 504 gateway-timeout)
(def-http-status 505 http-version-not-supported)
(def-http-status 506 variant-also-negotiates)
(def-http-status 507 insufficient-storage)
(def-http-status 508 loop-detected)
(def-http-status 510 not-extended)
(def-http-status 511 network-authentication-required)
