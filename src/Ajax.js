import axios from "axios";
import { isNotEmpty } from "./Helper";

//Function for making axios ajax calls
export function getAjaxCall(api, callbackFn) {
	const config = {
		method: "get",
		url: api,
	};
	axios
		.request(config)
		.then(function (response) {
			if (callbackFn) {
				callbackFn(response.data, null);
			} else {
				return response.data;
			}
		})
		.catch((error) => {
			if (isCallBackError(callbackFn, error)) {
				callbackFn(null, error.response.data);
			}
		});
}

function isCallBackError(callbackFn, error) {
	console.log("request error:" + error);

	if (callbackFn && isNotEmpty(error) && isNotEmpty(error.response)) {
		return true;
	}
	return false;
}
