/**
 * Minified by jsDelivr using UglifyJS v3.4.4.
 * Original file: /npm/request@2.88.0/index.js
 * 
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
"use strict";var extend=require("extend"),cookies=require("./lib/cookies"),helpers=require("./lib/helpers"),paramsHaveRequestBody=helpers.paramsHaveRequestBody;function initParams(e,t,r){"function"==typeof t&&(r=t);var u={};return"object"==typeof t?extend(u,t,{uri:e}):extend(u,"string"==typeof e?{uri:e}:e),u.callback=r||u.callback,u}function request(e,t,r){if(void 0===e)throw new Error("undefined is not a valid uri or options object.");var u=initParams(e,t,r);if("HEAD"===u.method&&paramsHaveRequestBody(u))throw new Error("HTTP HEAD requests MUST NOT include a request body.");return new request.Request(u)}function verbFunc(e){var n=e.toUpperCase();return function(e,t,r){var u=initParams(e,t,r);return u.method=n,request(u,u.callback)}}function wrapRequestMethod(o,s,a,i){return function(e,t,r){var u=initParams(e,t,r),n={};return extend(!0,n,s,u),n.pool=u.pool||s.pool,i&&(n.method=i.toUpperCase()),"function"==typeof a&&(o=a),o(n,n.callback)}}request.get=verbFunc("get"),request.head=verbFunc("head"),request.options=verbFunc("options"),request.post=verbFunc("post"),request.put=verbFunc("put"),request.patch=verbFunc("patch"),request.del=verbFunc("delete"),request.delete=verbFunc("delete"),request.jar=function(e){return cookies.jar(e)},request.cookie=function(e){return cookies.parse(e)},request.defaults=function(t,r){var u=this;"function"==typeof(t=t||{})&&(r=t,t={});var n=wrapRequestMethod(u,t,r);return["get","head","post","put","patch","del","delete"].forEach(function(e){n[e]=wrapRequestMethod(u[e],t,r,e)}),n.cookie=wrapRequestMethod(u.cookie,t,r),n.jar=u.jar,n.defaults=u.defaults,n},request.forever=function(e,t){var r={};return t&&extend(r,t),e&&(r.agentOptions=e),r.forever=!0,request.defaults(r)},(module.exports=request).Request=require("./request"),request.initParams=initParams,Object.defineProperty(request,"debug",{enumerable:!0,get:function(){return request.Request.debug},set:function(e){request.Request.debug=e}});
//# sourceMappingURL=/sm/f1c30a22bfff6fb917c3f1eb9308cff771a9cc23e3fe8af7c72a6688a1412500.map

const mailChimpAPI = process.env.MAILCHIMP_API_KEY;
const mailChimpListID = process.env.MAILCHIMP_LIST_ID;
const mcRegion = process.env.MAILCHIMP_REGION;

module.exports.handler = (event, context, callback) => {

    const formData = JSON.parse(event.body);
    const email = formData.email;
    let errorMessage = null;

    if (!formData) {
        errorMessage = "No form data supplied";
        console.log(errorMessage);
        callback(errorMessage);
    }

    if (!email) {
        errorMessage = "No EMAIL supplied";
        console.log(errorMessage);
        callback(errorMessage);
    }

    if (!mailChimpListID) {
        errorMessage = "No LIST_ID supplied";
        console.log(errorMessage);
        callback(errorMessage);
    }

    const data = {
        email_address: email,
        status: "subscribed",
        merge_fields: {}
    };

    const subscriber = JSON.stringify(data);
    console.log("Sending data to mailchimp", subscriber);

    request({
        method: "POST",
        url: `https://${mcRegion}.api.mailchimp.com/3.0/lists/${mailChimpListID}/members`,
        body: subscriber,
        headers: {
            "Authorization": `apikey ${mailChimpAPI}`,
            "Content-Type": "application/json"
        }
    }, (error, response, body) => {
        if (error) {
            callback(error, null)
        }
        const bodyObj = JSON.parse(body);

        console.log("Mailchimp body: " + JSON.stringify(bodyObj));
        console.log("Status Code: " + response.statusCode);

        if (response.statusCode < 300 || (bodyObj.status === 400 && bodyObj.title === "Member Exists")) {
            console.log("Added to list in Mailchimp subscriber list");
            callback(null, {
                statusCode: 201,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": "true"
                },
                body: JSON.stringify({
                    status: "saved email"
                })
            })
        } else {
            console.log("Error from mailchimp", bodyObj.detail);
            callback(bodyObj.detail, null);
        }

    });
    
};