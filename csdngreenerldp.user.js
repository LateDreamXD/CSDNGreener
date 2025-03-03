// ==UserScript==
// @name         「🍃CSDNGreener」 + ✨LDP✨
// @description  🍀CSDNGreener with LateDreamPatch
// @namespace    csdngreenerldp
// @version      4.2.4+ldpatch.0-hotfix.0
// @author       LateDream
// @connect      www.csdn.net
// @include      *://*.csdn.net/*
// @require      https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/jquery-cookie/1.4.1/jquery.cookie.min.js
// @require      https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/nprogress/0.2.0/nprogress.min.js
// @require      https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/clipboard.js/2.0.10/clipboard.min.js
// @supportURL   null
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @license      MIT
// @downloadURL https://dl.latedream.ggff.net/userscripts/csdngreenerldp.user.js
// @updateURL https://dl.latedream.ggff.net/userscripts/csdngreenerldp.user.js
// ==/UserScript==
var version = "4.2.4+ldpatch.0-hotfix.0";
var currentURL = window.location.href;
if (currentURL.indexOf("?") !== -1) {
	currentURL = currentURL.substring(0, currentURL.indexOf("?"));
}
var list;
var windowTop = 0;
var startTimeMilli = Date.now();
var stopTimeMilli = 0;
// 配置控制类
class Config {
	get(key, value) {
		var cookie = $.cookie(key);
		if (cookie == undefined) {
			new Config().set(key, value);
			console.debug("Renew key: " + key + " : " + value);
			return value;
		}
		console.debug("Read key: " + key + " : " + cookie);
		if (cookie === "true") { return true; }
		if (cookie === "false") { return false; }
		return cookie;
	}

	getS(key, value) {
		var cookie = $.cookie(key);
		if (cookie == undefined) {
			new Config().set(key, value);
			console.debug("Renew key: " + key + " : " + value);
			return value;
		}
		console.debug("Read key: " + key + " : " + cookie);
		return cookie;
	}

	set(setKey, setValue) {
		$.cookie(setKey, setValue, {
			path: '/',
			expires: 365
		});
		console.debug("Key set: " + setKey + " : " + setValue);
	}

	listenButton(element, listenKey, trueAction, falseAction) {
		$(element).click(function () {
			let status = new Config().get(listenKey, true);
			console.debug("Status: " + status);
			if (status === "true" || status) {
				console.debug("Key set: " + listenKey + " :: " + false);
				new Config().set(listenKey, false);
			} else {
				console.debug("Key set: " + listenKey + " :: " + true);
				new Config().set(listenKey, true);
			}
		});
	}

	listenButtonAndAction(element, listenKey, trueAction, falseAction) {
		$(element).click(function () {
			let status = new Config().get(listenKey, true);
			console.debug("Status: " + status);
			if (status === "true" || status) {
				console.debug("Key set: " + listenKey + " :: " + false);
				new Config().set(listenKey, false);
				falseAction();
			} else {
				console.debug("Key set: " + listenKey + " :: " + true);
				new Config().set(listenKey, true);
				trueAction();
			}
		});
	}
}
var config = new Config();
var progress = 0;
class Progress {
	init() {
		progress = 0;
		NProgress.start();
		$("#greenerProgress").text("绿化中...");
		$(".toolbar-search").hide();
	}

	setProgress(p) {
		progress = p;
		$("#greenerProgress").text(progress + "%");
		NProgress.set(progress / 100);
		console.log(progress + "%");
	}

	incProgress(p) {
		progress = progress + p;
		progress = progress > 100 ? 100 : progress;
		$("#greenerProgress").text(progress + "%");
		NProgress.set(progress / 100);
		console.log(progress + "%");
	}

	done() {
		progress = 100;
		NProgress.done();
		$("#greenerProgress").html(protect_svg + ' CSDNGreener 正在守护您的浏览体验');
		setTimeout(function() {
			$("#greenerProgress").fadeOut(500);
			setTimeout(function() {
				$(".toolbar-search").fadeIn(500);
				if (!isFirefox()) {
					// 提示
					let tipsCookie = config.get("showTip", true);
					if (tipsCookie) {
						showTips();
					}
					config.set("showTip", false);
				}
			}, 500);
		}, 1500);
	}
}
var progressor = new Progress();

// 预载样式
$('head').append(`<style id="csdngreenerldp-preload-styles">
	.tripscon{padding:10px}
	#csdngreenerldp-config {
		border-radius: 6px;
		position: fixed;
		top: 30%;
		left: 30%;
		transition: opacity 0.4s;
		opacity: 0;
		width: 40%;
		height: 40%;
		overflow: hidden;
		z-index: -1000;
	}
	.___window-header {
		padding: 6px 6px 0;
		background-color: var(--pico-primary, #000);
		display: inline-flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 10%;
		user-select: none;
		-webkit-user-select: none;
	}
	.___window-body {
		padding: 8px;
		color: var(--pico-color, #232323);
		background-color: var(--pico-background-color, #f5f5f5);
		display: flex;
		flex-direction: column;
		justify-content: center;
		overflow: auto;
		width: 100%;
		height: 90%;
	}
	.___window-shadow {
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(10px);
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: -1;
	}
	.___icon {
		width: 24px;
		height: 24px;
	}
`);

// SVG
//var save_svg = '<svg t="1595082650173" class="icon" viewBox="0 0 1075 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2078" width="140" height="140"><path d="M753.763902 685.830244a48.952195 48.952195 0 0 1 49.152-48.702439c81.420488 0 141.162146-65.386146 141.162147-146.057366 0-43.507512-13.037268-82.419512-43.457561-109.243317a142.360976 142.360976 0 0 0-20.280195-14.935415 158.045659 158.045659 0 0 0-11.239025-6.243902l-2.747317-1.298732a155.847805 155.847805 0 0 0-9.191024-3.996097c-1.348683-0.549463-2.697366-0.999024-4.096-1.498537a152.35122 152.35122 0 0 0-8.491707-2.847219c-1.948098-0.599415-3.896195-0.999024-5.844293-1.498537-2.497561-0.599415-4.945171-1.24878-7.492683-1.748293-2.597463-0.499512-5.34478-0.899122-8.042146-1.24878-1.948098-0.249756-3.846244-0.599415-5.844293-0.79922a153.150439 153.150439 0 0 0-14.435903-0.749268c-1.498537 0-2.997073 0.199805-4.545561 0.249756a265.390829 265.390829 0 0 0-5.594536-24.526049c-0.499512-1.998049-1.298732-3.846244-1.898146-5.844292a267.438829 267.438829 0 0 0-5.944196-17.982439c-0.649366-1.798244-1.498537-3.496585-2.197853-5.29483a283.123512 283.123512 0 0 0-7.742439-17.732683L772.745366 269.736585a282.973659 282.973659 0 0 0-9.790439-17.832585C714.302439 171.582439 625.88878 124.878049 524.487805 124.878049c-101.400976 0-189.914537 46.654439-238.517073 126.976-3.496585 5.794341-6.693463 11.788488-9.790439 17.832585l-2.197854 4.096a283.523122 283.523122 0 0 0-7.742439 17.732683l-2.197854 5.244878c-2.247805 5.894244-4.145951 11.988293-5.994146 18.03239-0.549463 1.998049-1.298732 3.846244-1.848195 5.844293a266.739512 266.739512 0 0 0-5.594537 24.476098c-1.498537 0-2.997073-0.199805-4.545561-0.199805-4.89522 0-9.690537 0.299707-14.485853 0.749268-1.998049 0.199805-3.846244 0.499512-5.794342 0.79922-2.697366 0.349659-5.444683 0.699317-8.092097 1.24878-2.497561 0.499512-4.995122 1.148878-7.492683 1.748293-1.898146 0.499512-3.846244 0.899122-5.794342 1.498536a153.649951 153.649951 0 0 0-8.491707 2.797269l-4.096 1.498536a164.289561 164.289561 0 0 0-9.240976 3.996098l-2.697366 1.348683a145.557854 145.557854 0 0 0-31.469268 21.179317C117.884878 408.600976 104.897561 447.562927 104.897561 491.070439c0 80.67122 59.741659 146.057366 141.162146 146.057366a48.952195 48.952195 0 0 1 49.152 48.702439 48.952195 48.952195 0 0 1-49.152 48.702439c-135.717463 0-245.710049-108.993561-245.710048-243.462244 0-109.692878 73.228488-202.402341 173.830243-232.872585A375.832976 375.832976 0 0 1 524.487805 20.330146a375.882927 375.882927 0 0 1 350.307902 237.867708c100.601756 30.470244 173.830244 123.179707 173.830244 232.872585 0 134.468683-109.992585 243.462244-245.710049 243.462244a48.952195 48.952195 0 0 1-49.102048-48.702439z" p-id="2079"></path><path d="M487.973463 386.122927a49.102049 49.102049 0 0 1 72.928781 0.099902l147.356097 162.041756c6.993171 7.742439 11.48878 19.431024 12.537757 30.120586l0.249756 12.937366c0 19.480976-20.48 39.661268-39.211708 39.661268h-104.897561v262.993171a52.44878 52.44878 0 1 1-104.897561 0v-262.993171h-104.897561c-13.886439 0-39.211707-21.72878-39.211707-39.661268v-12.987317c0-12.487805 4.795317-21.27922 12.637659-29.920781l147.356097-162.291512z" p-id="2080"></path></svg>';
var star_svg_1 = '<svg t="1595083631685" class="icon" viewBox="0 0 1051 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2173" width="140" height="140"><path d="M525.837838 852.410811L199.264865 1001.859459l41.513513-357.016216L0 381.924324l351.481081-69.189189L525.837838 0l174.356757 312.735135L1051.675676 381.924324l-240.778379 262.918919 41.513514 357.016216z" fill="#FFD566" p-id="2174"></path></svg>';
var star_svg_2 = ' <svg t="1595083715312" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7848" width="140" height="140"><path d="M1014.001347 866.090236L810.23569 662.324579l145.497643-84.126599c11.377778-6.550842 17.92862-18.962963 16.894276-32.064647-1.034343-13.101684-9.309091-24.479461-21.376431-29.306397l-648.188552-258.585859c-12.756902-5.171717-27.23771-2.068687-36.891582 7.585186-9.653872 9.653872-12.756902 24.13468-7.585185 36.891582l258.585858 648.533333c4.826936 12.06734 16.204714 20.686869 29.306397 21.376431 13.101684 1.034343 25.513805-5.516498 32.064647-16.894276l84.126599-145.497643 203.765657 203.765657c6.550842 6.550842 15.17037 9.998653 24.13468 9.998653 8.96431 0 17.92862-3.447811 24.13468-9.998653l99.29697-99.29697c13.446465-13.446465 13.446465-35.167677 0-48.614141zM150.324579 102.055219c-13.446465-13.446465-35.167677-13.446465-48.26936 0-13.446465 13.446465-13.446465 35.167677 0 48.26936l76.196633 76.196633c6.550842 6.550842 15.515152 9.998653 24.13468 9.998653s17.583838-3.447811 24.13468-9.998653c13.446465-13.446465 13.446465-35.167677 0-48.26936L150.324579 102.055219zM176.183165 338.575084c0-18.962963-15.17037-34.133333-34.133333-34.133333H34.133333c-18.962963 0-34.133333 15.17037-34.133333 34.133333s15.17037 34.133333 34.133333 34.133334h107.571718c18.962963 0 34.478114-15.17037 34.478114-34.133334zM162.391919 444.422896l-76.196633 75.851851c-13.446465 13.446465-13.446465 35.167677 0 48.269361 6.550842 6.550842 15.515152 9.998653 24.13468 9.998653s17.583838-3.447811 24.13468-9.998653l76.196633-76.196633c13.446465-13.446465 13.446465-35.167677 0-48.269361-13.446465-13.101684-35.167677-13.101684-48.26936 0.344782zM338.575084 176.183165c18.962963 0 34.133333-15.17037 34.133334-34.133333V34.133333c0-18.962963-15.17037-34.133333-34.133334-34.133333s-34.133333 15.17037-34.133333 34.133333v107.571718c0 18.962963 15.17037 34.478114 34.133333 34.478114zM468.557576 220.659933c8.619529 0 17.583838-3.447811 24.13468-9.998654L568.888889 134.464646c13.446465-13.446465 13.446465-35.167677 0-48.26936-13.446465-13.446465-35.167677-13.446465-48.26936 0l-76.196633 76.196633c-13.446465 13.446465-13.446465 35.167677 0 48.26936 6.550842 6.550842 15.515152 9.998653 24.13468 9.998654z" fill="#2c2c2c" p-id="7849"></path></svg>';
var star_svg_3 = ' <svg t="1595083925438" class="icon" viewBox="0 0 1204 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4809" width="140" height="140"><path d="M1088.864348 618.13701a1555.009384 1555.009384 0 0 1-150.273004 167.137308c-52.881642 51.195212-107.931552 101.18583-163.643989 147.261521-33.849069 27.524955-60.229661 48.665566-76.190521 60.229661a162.981462 162.981462 0 0 1-191.891699 0c-15.539253-12.045932-42.160763-32.644476-76.190521-60.831957a2638.480754 2638.480754 0 0 1-164.366745-147.261521 1579.101249 1579.101249 0 0 1-150.273004-165.812257A468.104924 468.104924 0 0 1 0.152998 344.754579 315.543193 315.543193 0 0 1 109.048225 96.367457a399.443111 399.443111 0 0 1 493.883219-20.478084 398.660125 398.660125 0 0 1 493.883219 20.478084A315.482964 315.482964 0 0 1 1204.746215 343.309067a466.840101 466.840101 0 0 1-115.701178 274.647254z" fill="#FE4B83" p-id="4810"></path></svg>';
var star_svg_4 = ' <svg t="1595084089115" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8008" width="140" height="140"><path d="M512 46.545455C256 46.545455 46.545455 256 46.545455 512s209.454545 465.454545 465.454545 465.454545 465.454545-209.454545 465.454545-465.454545S768 46.545455 512 46.545455z m0 837.818181c-204.8 0-372.363636-167.563636-372.363636-372.363636s167.563636-372.363636 372.363636-372.363636 372.363636 167.563636 372.363636 372.363636-167.563636 372.363636-372.363636 372.363636z" fill="#00C5C5" p-id="8009"></path><path d="M656.290909 586.472727c-79.127273 69.818182-209.454545 69.818182-288.581818 0-18.618182-13.963636-41.890909-13.963636-60.509091 4.654546-13.963636 13.963636-13.963636 41.890909 4.654545 60.509091 55.854545 51.2 125.672727 74.472727 200.145455 74.472727s144.290909-27.927273 200.145455-74.472727c18.618182-13.963636 18.618182-41.890909 4.654545-60.509091s-41.890909-18.618182-60.509091-4.654546zM358.4 460.8c27.927273 0 51.2-23.272727 51.2-51.2s-23.272727-55.854545-51.2-55.854545c-27.927273 0-51.2 23.272727-51.2 51.2s23.272727 55.854545 51.2 55.854545zM665.6 460.8c27.927273 0 51.2-23.272727 51.2-51.2s-23.272727-51.2-51.2-51.2-51.2 23.272727-51.2 51.2 23.272727 51.2 51.2 51.2z" fill="#00C5C5" p-id="8010"></path></svg>';
var star_svg = star_svg_1 + star_svg_2 + star_svg_3 + star_svg_4;
var donate_svg = '<svg t="1592982508258" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4207" width="32" height="32"><path d="M664.48 234.432a32 32 0 0 0-45.248-0.8l-76.256 73.6-73.344-73.216a32 32 0 1 0-45.248 45.312l72.384 72.256h-49.28a32 32 0 0 0 0 64h63.776v32h-63.776a32 32 0 0 0 0 64h63.776v65.664a32 32 0 1 0 64 0v-65.664h64.288a32 32 0 1 0 0-64h-64.288v-32h64.288a32 32 0 1 0 0-64h-50.368l74.464-71.872a32.032 32.032 0 0 0 0.832-45.28z m275.2 503.552a9017.568 9017.568 0 0 0-141.664-56.736 368.512 368.512 0 0 0 97.568-248.608c0-202.912-165.12-368-368.064-368s-368 165.088-368 368c0 16.224 1.024 32.352 3.072 47.968 2.304 17.504 18.496 29.664 35.904 27.584a32 32 0 0 0 27.584-35.904 304.512 304.512 0 0 1-2.56-39.648c0-167.616 136.384-304 304-304 167.648 0 304.064 136.384 304.064 304a300.544 300.544 0 0 1-96.128 221.472c-0.768 0.736-1.088 1.76-1.824 2.528-42.848-15.936-79.328-28.48-93.76-30.656-24.896-3.904-48.672 7.616-63.104 28.896-12.032 17.792-15.072 38.816-8.096 56.256 4.288 10.656 20.512 32.896 39.776 57.28-46.432-0.064-117.312-6.336-192.832-35.488-31.264-12.064-69.44-52.64-103.136-88.416-47.968-50.976-93.28-99.104-142.56-99.104-18.336 0-35.744 6.848-50.336 19.776-18.24 16.224-35.136 48.32-12 109.248 42.624 112.16 208.544 285.12 341.728 285.12h478.144a32 32 0 0 0 32-32v-160a31.84 31.84 0 0 0-19.776-29.568z m-44.16 157.6h-445.12l-1.024 32v-32c-97.6 0-247.072-152.128-281.92-243.872-10.112-26.656-6.72-37.408-5.344-38.624 4.128-3.648 6.528-3.648 7.84-3.648 21.632 0 64.608 45.632 95.968 78.944 40.224 42.752 81.856 86.944 126.656 104.256 85.216 32.896 164.896 39.808 216.736 39.808 41.376 0 67.584-4.352 68.672-4.544a32 32 0 0 0 19.136-52.16c-27.008-32.096-58.592-71.808-67.296-85.344 0.288-0.576 0.512-1.024 0.352-1.152 22.848 3.488 162.432 57.952 265.28 99.84v106.496z" p-id="4208"></path></svg>';
var set_svg = '<svg t="1592982970375" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10112" width="48" height="48"><path d="M256 102.4h512l256 256-512 563.2L0 358.4z" fill="#26CD63" p-id="10113"></path><path d="M256 102.4l256 256H0zM768 102.4l256 256H512zM512 921.6l204.8-563.2H307.2z" fill="#14A345" p-id="10114"></path></svg>';
var save_svg = '<svg t="1629448588351" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7849" width="200" height="200"><path d="M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0z m0 945.2C273.1 945.2 78.8 750.9 78.8 512S273.1 78.8 512 78.8 945.2 273.1 945.2 512 750.9 945.2 512 945.2z" p-id="7850" fill="#ffffff"></path><path d="M680.9 359.4L461 582.3 341.6 473.6c-16-14.6-41-13.4-55.6 2.6-14.7 16.1-13.5 41 2.6 55.6L436 666.1c7.5 6.8 17 10.2 26.5 10.2 10.2 0 20.3-3.9 28-11.7L737 414.7c15.3-15.5 15.1-40.4-0.4-55.7-15.5-15.2-40.5-15.1-55.7 0.4z" p-id="7851" fill="#ffffff"></path></svg>';
var settings_svg = '<svg class="___icon" t="1629433360462" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2870" width="200" height="200"><path d="M1006.438 17.548c-0.032 0-430.43-112.966-780.45 237.022-288.99 289.008-33.522 576.966-33.522 576.966s287.958 255.484 576.952-33.55C1119.436 448.012 1006.468 17.612 1006.438 17.548z" fill="#9ED36A" p-id="2871"></path><path d="M1006.438 17.548l-42.674-8.216c0.032 0.062 112.998 438.678-236.99 788.652-96.344 96.406-192.598 132.208-278.104 137.144 95.41 5.5 208-24.368 320.748-137.144C1119.436 448.012 1006.468 17.612 1006.438 17.548z" fill="#FFFFFF" opacity=".2" p-id="2872"></path><path d="M600.406 423.612c-8.308-8.34-21.836-8.34-30.148 0L6.4 987.426c-8.326 8.372-8.326 21.868 0 30.18 8.326 8.308 21.822 8.308 30.162 0L600.406 453.76c8.34-8.342 8.34-21.838 0-30.148z" fill="#8AC054" p-id="2873"></path></svg>';
var protect_svg = '<svg t="1629560538805" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3212" width="200" height="200"><path d="M800.3 205.1L534.8 116c-16-5.4-33.3-5.3-49.2 0.2l-264.5 92.3c-29.3 10-49 37.5-49.1 68.4l1.7 265.4c0.7 81 31.1 158.9 85.6 218.9 25 27.7 56.9 51.5 97.8 72.7l144 74.6c9 4.7 19.7 4.6 28.7-0.2L672.5 832c40.4-21.6 72.2-45.7 96.9-73.8 53.6-60.6 83-138.9 82.6-219.8l-1.7-265.6c-0.5-30.9-20.5-58.1-50-67.7z" fill="#07C160" p-id="3213"></path><path d="M474.1 652c-7.1 0-13.8-2.8-18.9-7.8l-151-151.1c-10.4-10.4-10.4-27.4 0-37.8s27.4-10.4 37.8 0l132.1 132.2 207.7-207.7c10.4-10.4 27.4-10.4 37.8 0 10.4 10.4 10.4 27.4 0 37.8L493 644.2c-5 5-11.8 7.8-18.9 7.8z" fill="#FFFFFF" p-id="3214"></path></svg>';


(function () {
	'use strict';

	l("CSDNGreener V" + version);
	if (isFirefox()) {
		console.log("您正在使用火狐浏览器，将使用兼容模式运行 CSDNGreener。");
	}
	progressor.init();

	// 设定按钮点击事件
	$("body").append(`<script id="csdngreener-preload">
		function csdnGreenerShowConfig() {
			$(window).scrollTop(0);
			$('#csdngreenerldp-config').css('opacity', 1).css('z-index', 1000);
			$('body').css('overflow', 'hidden');
		}
		function csdnGreenerSaveAndReload() {
			location.reload();
		}
	</script>`);

	setTimeout(function() {
		var blockURL = currentURL.split("/").length;
		var main = /(www\.csdn\.net\/)$/;
		var mainNav = /nav/;
		var article = /article/;
		var bbs = /bbs\.csdn\.net/;
		var blog = /blog\.csdn\.net/;
		var blog2 = /\/article\/list\//;
		var download = /download\.csdn\.net/;
		var login = /passport\.csdn\.net/;
		var zone = /me\.csdn\.net/;
		var other = /(www\.csdn\.net\/)/;
		var mp = /mp\.csdn\.net/;
		var article_month = /article\/month/;
		var link = /link\.csdn\.net/;
		var blink = /blink\.csdn\.net/;

		// 数组初始化
		list = [];
		// 头部分
		// APP
		// put(".app-app");
		// VIP
		put(".vip-caise");
		// 记录你的成长历程（记个毛）
		put("#writeGuide");
		// 新通知小圆点（未登录才消掉）
		if ($(".userinfo a").text() === '登录/注册') {
			put("#msg-circle");
		}
		// 顶部谷歌广告
		put(".adsbygoogle");
		// 悬浮在顶栏按钮上出现的二维码
		put(".appControl");
		// 顶部广告
		put(".advert-bg");

		if (main.test(currentURL) || mainNav.test(currentURL)) {
			l("正在优化主页体验...");
			// 常规
			// 头部广告
			put(".banner-ad-box");
			// 嵌入广告
			put("#kp_box_211");
			// 右侧广告
			put(".slide-outer");
			// 右侧详情
			put(".persion_article");
			// 右侧推荐
			$(".feed_company").parent().remove();
			// 广告轮播
			put(".el-carousel__container");
			// 顶部横幅
			put(".toolbar-advert");
			// 顶栏VIP选项
			$('.toolbar-subMenu-box').find("[href='https://mall.csdn.net/vip']").parent().remove();
			// CSDN工具广告
			put("#floor-ad_64");
			clean(10);
			// common(5, 10);
			// 博客及主页优化
			common(9, 10);
			loop(3);
			loop(1);
		} else if ((blog.test(currentURL) && blockURL === 4) || blog2.test(currentURL)) {
			l("正在优化个人博客主页体验...");
			// 常规
			// 头部广告
			put(".banner-ad-box");
			// 右侧广告
			put(".slide-outer");
			// 右侧详情
			put(".persion_article");
			// 左侧广告
			put(".mb8");
			put("#kp_box_503");
			put("#kp_box_214");
			clean(10);
			// common(5, 10);
			loop(3);
			loop(1);
		} else if (article.test(currentURL) && !mp.test(currentURL) && !article_month.test(currentURL)) {
			l("正在优化阅读体验...");
			// 绿化设定
			if (isFirefox()) {
				setTimeout(function() {
					$(".toolbar-container-middle").prepend("<div id='greenerProgress' style='text-align:right'></div>");
					let htmlOf0 = '<div class="toolbar-btn csdn-toolbar-fl"><a id="greenerSettings" title="CSDNGreener 选项" href="javascript:void(0)" onclick="csdnGreenerShowConfig();">' + settings_svg + '</a></div>';
					$(".toolbar-btns").prepend(htmlOf0);
					if (isFirefox()) {
						// 提示
						let tipsCookie = config.get("showTip", true);
						if (tipsCookie) {
							showTips();
						}
						config.set("showTip", false);
					}
				}, 3000);
			} else {
				$(".toolbar-container-middle").prepend("<div id='greenerProgress' style='text-align:right'></div>");
				let htmlOf0 = '<div class="toolbar-btn csdn-toolbar-fl"><a id="greenerSettings" title="CSDNGreener 选项" href="javascript:void(0)" onclick="csdnGreenerShowConfig();">' + settings_svg + '</a></div>';
				$(".toolbar-btns").prepend(htmlOf0);
			}
			// 常规
			// 右侧广告，放到第一个清除
			// put(".recommend-right");
			put("#addAdBox");
			// put(".aside-box.kind_person.d-flex.flex-column");
			put(".recommend-top-adbox");
			// put(".recommend-list-box.d-flex.flex-column.aside-box");
			// 左侧广告
			// put("#container");
			// 快来写博客吧
			put(".blog_tip_box");
			// 推荐关注用户
			put(".blog-expert-recommend-box");
			// 右下角VIP
			put(".meau-gotop-box");
			// 广告
			put(".mediav_ad");
			put(".pulllog-box");
			put(".recommend-ad-box");
			put(".box-shadow");
			put(".type_hot_word");
			put(".fourth_column");
			// 高分辨率时右侧文章推荐
			// put(".right-item");
			// 广告
			put("#asideFooter");
			put("#ad-div");
			put("#479");
			put("#480");
			// 打赏
			put(".postTime");
			// 课程推荐
			put(".t0");
			// 分享海报
			put(".shareSuggest");
			// 底部主题
			put(".template-box");
			// 评论区广告
			put("div#dmp_ad_58");
			// 打赏
			put(".reward-user-box");
			// 右侧打赏按钮
			put(".to-reward");
			// 推荐内容广告
			put(".recommend-recommend-box");
			// 右侧广告
			put(".indexSuperise");
			// 抢沙发角标
			put(".comment-sofa-flag");
			// 页jio
			put(".bottom-pub-footer");
			// 登录查看未读消息
			put(".toolbar-notice-bubble");
			// 右侧广告
			put(".recommend-top-adbox");
			// 右侧四个广告
			put(".programmer1Box");
			put(".programmer2Box");
			put(".programmer3Box");
			put(".programmer4Box");
			// 点赞气泡
			put(".triplet-prompt");
			// 顶部横幅
			put(".toolbar-advert");
			// 底部信息
			put(".blog-footer-bottom");
			// 右侧栏广告
			put("#6527");
			put("#recommendAdBox");
			// 推荐内容Title
			put(".recommend-tit-mod");
			// 红包提醒
			put(".csdn-redpack-lottery-btn-box");
			// 学生认证
			put(".csdn-highschool-window");
			// 右侧悬浮栏除置顶以外的按钮
			put(".option-box[data-type='guide'],.option-box[data-type='cs'],.csdn-common-logo-advert");
			// 登录后您可以享受以下权益
			put(".passport-login-tip-container");
			// 底栏“觉得还不错？立即收藏”你在教我做事？
			put(".tool-active-list");
			// 文章底部 archive推荐
			put("#treeSkill");
			// 搜索框fire emoji
			put(".icon-fire");

			// ---- ldpatch 添加内容 ----
			// 右下角 csdn deepseek 和自家推广
			put('#sidecolumn-deepseek');
			put('.csdn-side-toolbar>[data-type="app"]');
			// 顶栏构思新图标
			put('img[title="CSDN首页"]');
			// 顶栏垃圾分类( c 知道, gitcode, inscode)
			put('.toolbar-menus>[title=""]');
			put('.toolbar-menus>[title="开源代码托管"]');
			put('.toolbar-menus>[title="InsCode AI"]');
			// ==== ldpatch 添加内容 ====

			clean(10);
			setTimeout(function() {
			   // 展开评论的所有回复
			   $('.btn-read-reply').click();
			   // 右侧toolbar 创作提示
			   $(".sidetool-writeguide-box").remove();
			}, 1500);
			// 主动加入右侧栏
			if ($(".recommend-right").length === 0) {
				$("#mainBox").after('<div class="recommend-right  align-items-stretch clearfix" id="rightAside"><aside class="recommend-right_aside"><div id="recommend-right" style="height: 100%; position: fixed; top: 52px; overflow: scroll;"></div></aside></div>');
			}
			// 上栏按钮删除
			$(".toolbar-menus > li > a:contains('专栏课程')").parent().remove();
			$(".toolbar-menus > li > a:contains('插件')").parent().remove();
			$(".toolbar-menus > li > a:contains('认证')").parent().remove();
			// 修复无法选择复制
			$("code").css("user-select","auto");
			$("#content_views").css("user-select","auto");
			$("pre").css("user-select","auto");7
			// 图片混文字时，无法完整复制，图片不会被复制下来 https://github.com/adlered/CSDNGreener/issues/87
			//let el = $("main .blog-content-box")[0];
			//let elClone = el.cloneNode(true);
			//el.parentNode.replaceChild(elClone, el);
			// 保存csdn的网页再次打开会自动跳转到首页 https://github.com/adlered/CSDNGreener/issues/97
			$("[onerror]").remove();
			// CSDN重定向外链不能在新的窗口跳转 https://github.com/adlered/CSDNGreener/issues/80
			$("#article_content a[href]").attr("target", "_blank");
			// 搜索框优化
			//$("#toolbar-search-input").css("width", "calc(100% - 400px)");
			// 取消代码折叠
			$(".look-more-preCode").click();
			// 询问推荐是否有意义的问卷调查
			$("#recommendNps").remove();
			// 绿化设置
			common(6, 1);
			// 屏幕适配
			common(4, 1);
			// 评论
			common(1, 30);
			// 其它
			common(2, 20);
			// 顶部显示作者信息
			common(8, 1);
			// 博客及主页优化
			common(9, 10);
			// 循环线程开始
			loop(2);
			loop(3);
		} else if (bbs.test(currentURL)) {
			l("正在优化论坛体验...");
			// 常规
			// 评论嵌入小广告
			put(".post_recommend");
			// 底部推荐
			put("#post_feed_wrap");
			// 底部相关文章里面的广告
			put(".bbs_feed_ad_box");
			put(".recommend-ad-box");
			// 底部相关文字里面的热词提示
			put(".type_hot_word");
			// 底部蓝色flex属性的广告栏+登录注册框
			put(".pulllog-box");
			// 猜你喜欢
			put(".personalized-recommend-box");
			// 发帖减半提示
			put(".totast-box");
			// 顶部广告
			put(".recommend-right");
			// 顶部广告
			put(".ad_top");
			// 右侧广告
			put(".ad_1");
			clean(10);
			// 展开
			common(3, 50);
			// common(5, 10);
			loop(3);
		} else if (download.test(currentURL)) {
			l("正在优化下载页体验...");
			// 常规
			put(".fixed_dl");
			put("indexSuperise");
			// 右侧推荐
			put(".content_recom");
			clean(10);
			// common(5, 10);
			loop(3);
		} else if (login.test(currentURL)) {
			l("正在优化登录页体验...");
			// 常规
			// 登录界面大图广告
			put(".main-tu");
			clean(10);
			// common(5, 10);
			loop(3);
		} else if (zone.test(currentURL)) {
			l("正在优化个人空间体验...");
			// 常规
			clean(10);
			common(7, 10);
			// common(5, 10);
			loop(3);
		} else if (blink.test(currentURL)) {
			l("正在优化个人动态体验...");
		} else if (link.test(currentURL)) {
			// 跳过 CSDN 的 link 页面
			var url = new URL(window.location.href)
			var target = url.searchParams.get('target')
			window.location.href = target
		} else {
			l("哦豁，好偏门的页面，我来试着优化一下哦...");
			// 常规
			// 展开全文
			$('.readmore_btn').click();
			// *** index ***
			// 头部广告
			put(".banner-ad-box");
			// 嵌入广告
			put("#kp_box_211");
			// 右侧广告
			put(".slide-outer");
			// 右侧详情
			put(".persion_article");
			// 右侧推荐
			$(".feed_company").parent().remove();
			// *** article ***
			// 常规
			// 右侧广告，放到第一个清除
			put("#addAdBox");
			put(".recommend-top-adbox");
			// 快来写博客吧
			put(".blog_tip_box");
			// 推荐关注用户
			put(".blog-expert-recommend-box");
			// 右下角VIP
			put(".meau-gotop-box");
			// 广告
			put(".mediav_ad");
			put(".pulllog-box");
			put(".recommend-ad-box");
			//put(".box-shadow"); 某些页面异常，例如cloud.csdn.net
			put(".type_hot_word");
			put(".fourth_column");
			// cloud.csdn.net 头部广告
			put("#kp_box_118");
			// 广告
			put("#asideFooter");
			put("#ad-div");
			put("#479");
			put("#480");
			// 打赏
			put(".postTime");
			// 课程推荐
			put(".t0");
			// 分享海报
			put(".shareSuggest");
			// 底部主题
			put(".template-box");
			// 评论区广告
			put("div#dmp_ad_58");
			// 打赏
			put(".reward-user-box");
			// 右侧打赏按钮
			put(".to-reward");
			// 推荐内容广告
			put(".recommend-recommend-box");
			// 右侧广告
			put(".indexSuperise");
			// 抢沙发角标
			put(".comment-sofa-flag");
			// 页jio
			put(".bottom-pub-footer");
			// 登录查看未读消息
			put(".toolbar-notice-bubble");
			// 右侧广告
			put(".recommend-top-adbox");
			// 学院弹出广告
			$(".fouce_close_btn").click();
			// 其它
			// 头部广告
			put(".banner-ad-box");
			// 右侧广告
			put(".slide-outer");
			// 右侧详情
			put(".persion_article");
			// 左侧广告
			put("#kp_box_503");
			put("#kp_box_214");
			// *** bbs ***
			// 评论嵌入小广告
			put(".post_recommend");
			// 底部推荐
			put("#post_feed_wrap");
			// 底部相关文章里面的广告
			put(".bbs_feed_ad_box");
			put(".recommend-ad-box");
			// 底部相关文字里面的热词提示
			put(".type_hot_word");
			// 底部蓝色flex属性的广告栏+登录注册框
			put(".pulllog-box");
			// 猜你喜欢
			put(".personalized-recommend-box");
			// 发帖减半提示
			put(".totast-box");
			// 顶部广告
			put(".recommend-right");
			// 顶部广告
			put(".ad_top");
			// *** download ***
			put(".fixed_dl");
			put("indexSuperise");
			// 右侧推荐
			put(".content_recom");
			clean(10);
		}
		setTimeout(function() {
			progressor.done();
		}, 0);
		stopTimeMilli = Date.now();
		l("优化完毕! 耗时 " + (stopTimeMilli - startTimeMilli) + "ms");
	}, 0);
})();

function l(log) {
	console.log("[CSDNGreener] " + log);
}

function e(error) {
	console.error("[CSDNGreener] " + error);
}

function clear() {
	list = [];
}

function put(tag) {
	list.push(tag);
}

function clean(times) {
	var loop = setInterval(function () {
		--times;
		if (times <= 0) {
			clearInterval(loop);
		}
		for (var k = 0; k < list.length; k++) {
			$(list[k]).remove();
		}
	}, 100);
	progressor.incProgress(10);
}

var deletedLogin = false;

function loop(num) {
	setInterval(function () {
		if (num === 1) {
			// 主页中间的广告
			$(".J_adv").remove();
			// 主页有新的内容横条
			$(".feed-fix-box").remove();
			// 主页广告 iframe
			if (currentURL == "https://www.csdn.net/") {
				$("iframe").remove();
			}
			// 删除 CSDN 官方在主页的文章（大多是广告）
			$("li.clearfix").each(function(index, ele) {
				var banned = /csdn<\/a>/;
				var aMark = $(ele).find(".name").html();
				if (banned.test(aMark)) {
					$(ele).remove();
				}
			});
			// 主页广告
			$("li").each(function(){
				let self = $(this);
				let dataType = self.attr('data-type');
				if (dataType === 'ad') {
					self.remove();
				}
			});
			// 主页广告
			$("li > div > div > h2 > a[href*='https://edu.csdn.net']").parent().parent().parent().parent().remove();
			$("li > div > div > h2 > a[href*='https://marketing.csdn.net']").parent().parent().parent().parent().remove();
			// 官方脚本横幅
			$(".toolbar-advert").remove();
		} else if (num === 2) {
			// 评论查看更多展开监听
			$("div.comment-list-box").css("max-height", "none");
			// 屏蔽您的缩放不是100%的提示
			$('.leftPop').remove();
			// 官方脚本横幅
			$(".toolbar-advert").remove();
		} else if (num == 3) {
			// 循环删除登录提示框
			if ($($(".passport-login-container")[0]).length == 1 && deletedLogin == false) {
				let passInterval = setInterval(function() {
					$('.passport-login-container').hide();
					// console.log("hide");
				}, 10);
				setTimeout(function() {
					clearInterval(passInterval);
					setTimeout(function() {
						$("#passportbox").find("img").click();
					}, 500)
				}, 5000);
				deletedLogin = true;
			}
			// 红包雨
			$("#csdn-redpack").remove();
		}
	}, 500);
}

function common(num, times) {
	var loop = setInterval(function () {
		--times;
		if (times <= 0) {
			clearInterval(loop);
		}
		if (num === 1) {
			// 查看更多
			$(".btn-readmore").removeClass("no-login");
			$(".btn-readmore").addClass("fans-read-more");
			$(".btn-readmore").removeAttr("href");
			$(".btn-readmore").removeAttr("target");
			$(".btn-readmore").removeAttr("rel");
			$(".btn-readmore").click();
			// 已登录用户展开评论
			try {
				document.getElementById("btnMoreComment").click();
			} catch (e) {}
			// 删除查看更多按钮
			$("#btnMoreComment").parent("div.opt-box").remove();
			// 展开内容
			$("div.comment-list-box").css("max-height", "none");
			// 改回背景颜色
			$(".login-mark").remove();
			// 删除登录框
			$(".login-box").remove();
		} else if (num === 2) {
			// 挡住评论的“出头推荐”
			if ($(".recommend-box").length > 1) {
				$(".recommend-box")[0].remove();
			}
			// 去除推广广告
			$("li[data-type='ad']").remove();
			// 免登录复制
			$(".hljs-button").removeClass("signin");
			$(".hljs-button").addClass("{2}");
			$(".hljs-button").attr("data-title", "直接复制");
			$(".hljs-button").attr("onclick", "hljs.copyCode(event);setTimeout(function(){$('.hljs-button').attr('data-title', '免登录复制');},3500);");
			$("#content_views").unbind("copy");
			// 去除剪贴板劫持
			$("code").attr("onclick", "mdcp.copyCode(event)");
			try {
				// 复制时保留原文格式，参考 https://greasyfork.org/en/scripts/390502-csdnremovecopyright/code
				Object.defineProperty(window, "articleType", {
					value: 0,
					writable: false,
					configurable: false
				});
			} catch (err) {
			}
			csdn.copyright.init("", "", "");
			// 页头广告
			try {
				document.getElementsByClassName("column-advert-box")[0].style.display="none";
			} catch (e) {}
			// 自动检测是否有目录，如果没有则删除右边栏，文章居中
			if ($(".recommend-right_aside").html() && $(".recommend-right_aside").html().replace(/[\r\n]/g, "").replace(/(\s)/g, "") === "") {
				$("#rightAside").remove();
			} else if ($(".recommend-right_aside").html() && $("#recommend-right").html().replace(/[\r\n]/g, "").replace(/(\s)/g, "") === "") {
				$("#rightAside").remove();
			}
			// 登录按钮文字太多，修改
			$("a").each(function() {
				if ($(this).attr('href') === 'https://passport.csdn.net/account/login') {
					$(this).html('登入');
				}
			});
			// 顶栏广告
			$("li").each(function(){
				let self = $(this);
				let dataType = self.attr('data-sub-menu-type');
				if (dataType === 'vip') {
					self.remove();
				}
				let dataTitle = self.attr('title');
				if (dataTitle === '高价值源码课程分享' || dataTitle === '系统学习·问答·比赛' || dataTitle === '简单高效优惠的云服务') {
					self.remove();
				}
			});
			// 顶栏VIP选项
			$('.toolbar-subMenu-box').find("[href='https://mall.csdn.net/vip']").parent().remove();
		} else if (num == 3) {
			//论坛自动展开
			$(".js_show_topic").click();
		} else if (num == 4) {
			/** 配置控制 **/
			let config = new Config();
			let smCookie = config.get("scr-sm", true);
			let mdCookie = config.get("scr-md", false);
			let lgCookie = config.get("scr-lg", false);
			let foCookie = config.get("scr-fo", false)

			$("#scr-sm").prop("checked", smCookie);
			$("#scr-md").prop("checked", mdCookie);
			$("#scr-lg").prop("checked", lgCookie);
			$("#scr-fo").prop("checked", foCookie);

			if (smCookie) {
				// Small Screen Mode
				$(".main_father").removeClass("justify-content-center");
				GM_addStyle(`
				main{
					width: auto!important;
					float: none!important;
					max-width: 90vw;
				}
				main article img{
					margin: 0 auto;
					max-width: 100%;
					object-fit: cover;
				}
				`);
				$("#mainBox").css("width", "100%");
			} else if (mdCookie) {
				// Middle Screen Mode
				$(".main_father").removeClass("justify-content-center");
			} else if (lgCookie) {
				// Large Screen Mode
				$(".container").css("margin", "0 auto")
			} else if (foCookie) {
				// Focus mode
				$(".recommend-right").remove();
				$(".container").css("width", "100%");
				$(".container > main").css("width", "100%");
			}

			// 屏幕尺寸单选监听
			$("#scr-sm").click(function () {
				new Config().set("scr-sm", true);
				new Config().set("scr-md", false);
				new Config().set("scr-lg", false);
				new Config().set("scr-fo", false);
			});
			$("#scr-md").click(function () {
				new Config().set("scr-md", true);
				new Config().set("scr-sm", false);
				new Config().set("scr-lg", false);
				new Config().set("scr-fo", false);
			});
			$("#scr-lg").click(function () {
				new Config().set("scr-lg", true);
				new Config().set("scr-sm", false);
				new Config().set("scr-md", false);
				new Config().set("scr-fo", false);
			});
			$("#scr-fo").click(function () {
				new Config().set("scr-fo", true);
				new Config().set("scr-sm", false);
				new Config().set("scr-md", false);
				new Config().set("scr-lg", false);
			});
			// 判断是否为登录状态
			if ($('.toolbar-btn-loginfun').text() === '登录') {
					// 未登录删除无用按钮
					$("a:contains('消息')").parent().parent()[0].remove();
					$(".toolbar-btn-collect").remove();
					$(".toolbar-btn-write").remove();
					$(".toolbar-btn-mp").remove();
			}
			$("a:contains('会员12.12')").parent().remove();
			$(".toolbar-btn-vip").remove();
		} else if (num == 5) {
			// 改回背景颜色
			$(".login-mark").remove();
			// 删除登录框
			$(".login-box").remove();
		} else if (num == 6) {
			let configHTML = `
				<div id="csdngreenerldp-config">
					<div class="___window-header">
						<span style="color: var(--pico-h1-color, #fff);">${settings_svg} CSDNGreener V${version}</span>
						<span class="___window-actions">
							<a href="#close" onclick="csdnGreenerSaveAndReload();">✅</a>
						</span>
					</div>
					<div class="___window-body"><div style="height: 100%;">
						<h6>UI 版式</h6>
						<p>建议逐个尝试后选择适合你的版式，屏幕过小或者版式选择不正确右侧栏可能没有空间显示，导致侧栏定制无效（请尝试调节浏览器缩放，快捷键 Ctrl+鼠标滚轮）。</p>
						<label><input name="displayMode" type="radio" value="" id="scr-sm"> 平铺模式(优化版) </label>
						<label><input name="displayMode" type="radio" value="" id="scr-md"> 适应模式 </label>
						<label><input name="displayMode" type="radio" value="" id="scr-lg"> 居中模式 </label>
						<label><input name="displayMode" type="radio" value="" id="scr-fo"> 沉浸模式(无侧栏)</label>
						<hr style="height:1px;border:none;border-top:1px solid #cccccc;margin: 5px 0px 5px 0px;">
						<h6>通用设定</h6>
						<!-- <p>自定义背景图</p>
						<input type="text" id="backgroundImgUrl" placeholder="请输入图片地址">
						<input type="file" id="upload_bg" accept="image/*" /> -->
						<input type="checkbox" role="switch" id="toggle-recommend-button"> <label for="toggle-recommend-button" class="modeLabel">显示推荐内容</label><br>
						<input type="checkbox" role="switch" id="toggle-shop-button"> <label for="toggle-shop-button" class="modeLabel">显示小店</label><br>
						<input type="checkbox" role="switch" id="toggle-autosize-button"> <label for="toggle-autosize-button" class="modeLabel">宽度自动适应&emsp;<span style="color: #808080;"># 选项作用：开启此选项可以在页面宽度缩小时自动切换至小屏模式</span></label><br>
						<input type="checkbox" role="switch" id="toggle-autohidetoolbar-button"> <label for="toggle-autohidetoolbar-button" class="modeLabel">向下滚动自动隐藏顶栏</label><br>
						<input type="checkbox" role="switch" id="toggle-autohidebottombar-button"> <label for="toggle-autohidebottombar-button" class="modeLabel">始终隐藏底栏</label><br>
						<input type="checkbox" role="switch" id="toggle-writeblog-button"> <label for="toggle-writeblog-button" class="modeLabel">显示发布按钮</label><br>
						<hr style="height:1px;border:none;border-top:1px solid #cccccc;margin: 5px 0px 5px 0px;">
						<h6>右侧栏定制</h6>
						<input type="checkbox" role="switch" id="toggle-authorcard-button"> <label for="toggle-authorcard-button" class="modeLabel">显示作者名片</label><br>
						<input type="checkbox" role="switch" id="toggle-searchblog-button"> <label for="toggle-searchblog-button" class="modeLabel">显示搜博主文章</label><br>
						<input type="checkbox" role="switch" id="toggle-newarticle-button"> <label for="toggle-newarticle-button" class="modeLabel">显示最新文章</label><br>
						<input type="checkbox" role="switch" id="toggle-hotarticle-button"> <label for="toggle-hotarticle-button" class="modeLabel">显示热门文章</label><br>
						<input type="checkbox" role="switch" id="toggle-newcomments-button"> <label for="toggle-newcomments-button" class="modeLabel">显示最新评论</label><br>
						<input type="checkbox" role="switch" id="toggle-kindperson-button"> <label for="toggle-kindperson-button" class="modeLabel">显示分类专栏</label><br>
						<input type="checkbox" role="switch" id="toggle-recommendarticle-button"> <label for="toggle-recommendarticle-button" class="modeLabel">显示推荐文章</label><br>
						<input type="checkbox" role="switch" id="toggle-archive-button"> <label for="toggle-archive-button" class="modeLabel">显示归档</label><br>
						<input type="checkbox" role="switch" id="toggle-content-button"> <label for="toggle-content-button" class="modeLabel">显示目录</label><br><br>
						<h6><img class="___icon" src="https://i.latedream.ggff.net/static/avatar.webp" /> LateDreamPatch 设定</h6>
						<label>补丁版本: ${version.split('+')[1]}</label><br />
						<input type="checkbox" role="switch" id="ldptoggle-injectpicocss" /> <label for="ldptoggle-injectpicocss">注入 Pico 样式(推荐开启)</label><br />
					</div></div>
					<div class="___window-shadow"></div>
				</div>
			`;
			$('body').append(configHTML);

			/** 配置控制 **/
			// 推荐内容
			$(".blog-content-box").append("<br><div class='blog-content-box' id='recommendSwitch' style='text-align: right;'></div>");
			$("#recommendSwitch:last").append('<input type="checkbox" role="switch" id="showRecommend">' +
							   '<label for="showRecommend" style="font-size: 14px; margin-left: 4px;">显示推荐内容</label>');
			let recommendCookie = config.get("recommend", false);
			if (!recommendCookie) {
				$(".recommend-box").hide();
			}
			if (recommendCookie) {
				$("#toggle-recommend-button").prop("checked", true);
				$("#toggle-button").prop("checked", true);
			} else {
				$("#toggle-recommend-button").prop("checked", false);
				$("#toggle-button").prop("checked", false);
			}
			config.listenButton("#toggle-recommend-button", "recommend",
							   function() {$(".recommend-box").slideDown(200);},
							   function() {$(".recommend-box").slideUp(200);});
			config.listenButtonAndAction("#showRecommend", "recommend",
								function() {$(".recommend-box").slideDown(200);},
							   function() {$(".recommend-box").slideUp(200);});

			// 显示小店
			let shopCookie = config.get('shop',false);
			if(!shopCookie){
				$("#csdn-shop-window").hide();
				$("#csdn-shop-window-top").hide();
			}
			if (shopCookie) {
				$("#toggle-shop-button").prop("checked", true);
			} else {
				$("#toggle-shop-button").prop("checked", false);
			}
			config.listenButton("#toggle-shop-button", "shop",
								function() {location.reload();},
								function() {location.reload();});
			// 显示作者名片
			let authorCardCookie = config.get("authorCard", true);
			if (authorCardCookie) {
				// 博主信息
				$('#recommend-right').append($('#asideProfile').prop("outerHTML"));
				setTimeout(function() {
					$('#asideProfile').attr("style", "margin-top: 8px; width: 300px;");
				}, 500);
			}
			if (authorCardCookie) {
				$("#toggle-authorcard-button").prop("checked", true);
			} else {
				$("#toggle-authorcard-button").prop("checked", false);
			}
			config.listenButton("#toggle-authorcard-button", "authorCard",
							   function() {location.reload();},
							   function() {location.reload();});

			// 背景图
			let backgroundImage = GM_getValue("backgroundImage", "");
			if (backgroundImage !== "") {
				$("#backgroundImgUrl").val(backgroundImage);
				$(".main_father").attr('style', 'background-image:url(' + backgroundImage + ');background-attachment:fixed;background-size:100%;');
			}
			$('#backgroundImgUrl').on('input', function() {
				GM_setValue("backgroundImage", $("#backgroundImgUrl").val());
			});
			$('#backgroundImgUrl').on('change', function() {
				GM_setValue("backgroundImage", $("#backgroundImgUrl").val());
			});
			$("#upload_bg").on('change', function() {
				let file = $("#upload_bg")[0].files[0];
				let reader = new FileReader();
				reader.onloadend = function (e) {
					let base64 = e.target.result;
					$('#backgroundImgUrl').val(base64);
					$('#backgroundImgUrl').change();
				}
				reader.readAsDataURL(file);
			});

			// 搜博主文章
			let searchBlogCookie = config.get("searchBlog", false);
			if(searchBlogCookie) {
				$('#recommend-right').append($('#asideSearchArticle').prop("outerHTML"));
				setTimeout(function() {
					$('#asideSearchArticle').attr("style", "margin-top: 8px; width: 300px;");
					var i = $("#search-blog-words")
					  , n = $(".btn-search-blog");
					i.keyup(function(t) {
						var n = t.keyCode;
						if (13 == n) {
							var e = encodeURIComponent(i.val());
							if (e) {
								var s = "//so.csdn.net/so/search/s.do?q=" + e + "&t=blog&u=" + username;
								window.open(s)
							}
						}
					});
					n.on("click", function(t) {
						var n = encodeURIComponent(i.val());
						if (n) {
							var e = "//so.csdn.net/so/search/s.do?q=" + n + "&t=blog&u=" + username;
							window.open(e)
						}
						t.preventDefault()
					});
				}, 500);
			}
			if (searchBlogCookie) {
				$("#toggle-searchblog-button").prop("checked", true);
			} else {
				$("#toggle-searchblog-button").prop("checked", false);
			}
			config.listenButton("#toggle-searchblog-button", "searchBlog",
							   function() {location.reload();},
							   function() {location.reload();});

			// 最新文章
			let newArticleCookie = config.get("newArticle", false);
			if (newArticleCookie) {
				$('#recommend-right').append($('#asideNewArticle').prop("outerHTML"));
				setTimeout(function() {
					$('#asideNewArticle').attr("style", "margin-top: 8px; width: 300px;");
				}, 0);
			}
			if (newArticleCookie) {
				$("#toggle-newarticle-button").prop("checked", true);
			} else {
				$("#toggle-newarticle-button").prop("checked", false);
			}
			config.listenButton("#toggle-newarticle-button", "newArticle",
							   function() {location.reload();},
							   function() {location.reload();});

			// 热门文章
			let hotArticleCookie = config.get("hotArticle", false);
			if (hotArticleCookie) {
				$('#recommend-right').append($("#asideHotArticle").prop("outerHTML"));
				setTimeout(function() {
					$('#asideHotArticle').attr("style", "margin-top: 8px; width: 300px;");
					$('#asideHotArticle img').remove();
				}, 0);
			}
			if (hotArticleCookie) {
				$("#toggle-hotarticle-button").prop("checked", true);
			} else {
				$("#toggle-hotarticle-button").prop("checked", false);
			}
			config.listenButton("#toggle-hotarticle-button", "hotArticle",
							   function() {location.reload();},
							   function() {location.reload();});

			// 最新评论
			let newCommentsCookie = config.get("newComments", false);
			if (newCommentsCookie) {
				$('#recommend-right').append($("#asideNewComments").prop("outerHTML"));
				setTimeout(function() {
					$('#asideNewComments').attr("style", "margin-top: 8px; width: 300px;");
					$(".comment.ellipsis").attr("style", "max-height: none;");
					$(".title.text-truncate").attr("style", "padding: 0");
				}, 0);
			}
			if (newCommentsCookie) {
				$("#toggle-newcomments-button").prop("checked", true);
			} else {
				$("#toggle-newcomments-button").prop("checked", false);
			}
			config.listenButton("#toggle-newcomments-button", "newComments",
							   function() {location.reload();},
							   function() {location.reload();});

			// 分类专栏
			let kindPersonCookie = config.get("kindPerson", false);
			if (!kindPersonCookie) {
				setTimeout(function() {
					$('#asideCategory').remove();
					$('.kind_person').remove();
				}, 0);
			} else {
				$('#recommend-right').append($("#asideCategory").prop("outerHTML"));
				if ($("#asideCategory").length > 0) {
					$('.kind_person').remove();
				} else {
					$('.kind_person').attr("style", "margin-top: 8px; width: 300px; height:255px;");
				}
				setTimeout(function() {
					$('#asideCategory').attr("style", "margin-top: 8px; width: 300px; display:block !important;");
					$("a.flexible-btn").click(function() {
						$(this).parents('div.aside-box').removeClass('flexible-box');
						$(this).parents("p.text-center").remove();
					})
				}, 500);
			}
			if (kindPersonCookie) {
				$("#toggle-kindperson-button").prop("checked", true);
			} else {
				$("#toggle-kindperson-button").prop("checked", false);
			}
			config.listenButton("#toggle-kindperson-button", "kindPerson",
							   function() {location.reload();},
							   function() {location.reload();});

			// 目录
			let contentCookie = config.get("content", true);
			if (!contentCookie) {
				setTimeout(function() {
					$('.align-items-stretch.group_item').parent().remove();
				}, 0);
			}
			if (contentCookie) {
				$("#toggle-content-button").prop("checked", true);
			} else {
				$("#toggle-content-button").prop("checked", false);
			}
			config.listenButton("#toggle-content-button", "content",
							   function() {location.reload();},
							   function() {location.reload();});

			// 推荐文章
			let recommendArticleCookie = config.get("recommendArticle", false);
			if (!recommendArticleCookie) {
				setTimeout(function() {
					$('.recommend-list-box').remove();
				}, 0);
			} else {
				setTimeout(function() {
					$('.recommend-list-box').attr("style", "margin-top: 8px; width: 300px; height:255px;");
				}, 0);
			}
			if (recommendArticleCookie) {
				$("#toggle-recommendarticle-button").prop("checked", true);
			} else {
				$("#toggle-recommendarticle-button").prop("checked", false);
			}
			config.listenButton("#toggle-recommendarticle-button", "recommendArticle",
							   function() {location.reload();},
							   function() {location.reload();});

			// 归档
			let archiveCookie = config.get("archive", false);
			if (!archiveCookie) {
				setTimeout(function() {
					$('#asideArchive').remove();
				}, 0);
			} else {
				$('#recommend-right').append($("#asideArchive").prop("outerHTML"));
				setTimeout(function() {
					$('#asideArchive').attr("style", "margin-top: 8px; width: 300px; display:block !important;");
				}, 500);
			}
			if (archiveCookie) {
				$("#toggle-archive-button").prop("checked", true);
			} else {
				$("#toggle-archive-button").prop("checked", false);
			}
			config.listenButton("#toggle-archive-button", "archive",
							   function() {location.reload();},
							   function() {location.reload();});

			// 自动靠左平铺
			let autoSizeCookie = config.get("autoSize", false);
			if (autoSizeCookie) {
				setInterval(function () {
					let did; // 避免控制台无限报错
					// 文章宽度自适应
					if (window.innerWidth < 1100) {
						// 删除原有响应式样式
						$(".main_father").removeClass("justify-content-center");
						$("article").width(window.innerWidth - 150);
						GM_addStyle(`
						main{
							width: auto!important;
							float: none!important;
							max-width: 90vw;
						}
						main article img{
							margin: 0 auto;
							max-width: 100%;
							object-fit: cover;
						}
						`);
						did = true;
					} else {
						if (did === true) {
							$("article").removeAttr("style");
							did = false;
						}
					}
				}, 500);
			}
			if (autoSizeCookie) {
				$("#toggle-autosize-button").prop("checked", true);
			} else {
				$("#toggle-autosize-button").prop("checked", false);
			}
			config.listenButton("#toggle-autosize-button", "autoSize",
							   function() {location.reload();},
							   function() {location.reload();});

			// 自动隐藏顶栏
			let autoHideToolbarCookie = config.get("autoHideToolbar", true);
			if (autoHideToolbarCookie) {
				$(window).scroll(function() {
					if (document.documentElement.scrollTop > 100) {
						let scrollS = $(this).scrollTop();
						if (scrollS >= windowTop) {
							$('#csdn-toolbar').slideUp(100);
							windowTop = scrollS;
						} else {
							$('#csdn-toolbar').slideDown(100);
							windowTop = scrollS;
						}
					}
				});
			}
			if (autoHideToolbarCookie) {
				$("#toggle-autohidetoolbar-button").prop("checked", true);
			} else {
				$("#toggle-autohidetoolbar-button").prop("checked", false);
			}
			config.listenButton("#toggle-autohidetoolbar-button", "autoHideToolbar",
							   function() {location.reload();},
							   function() {location.reload();});

			// 自动隐藏底栏
			let autoHideBottomBarCookie = config.get("autoHideBottomBar", true);
			if (autoHideBottomBarCookie) {
				$("#toolBarBox .left-toolbox").css({
					position: "relative",
					left: "0px",
					bottom: "0",
					width: $("#toolBarBox").width() + "px"
				});
				$(window).scroll(function() {
					$("#toolBarBox .left-toolbox").css({
						position: "relative",
						left: "0px",
						bottom: "0",
						width: $("#toolBarBox").width() + "px"
					})
				});
			}
			if (autoHideBottomBarCookie) {
				$("#toggle-autohidebottombar-button").prop("checked", true);
			} else {
				$("#toggle-autohidebottombar-button").prop("checked", false);
			}
			config.listenButton("#toggle-autohidebottombar-button", "autoHideBottomBar",
							   function() {location.reload();},
							   function() {location.reload();});

			// 创作中心按钮
			let writeBlogCookie = config.get("writeBlog", true);
			if (!writeBlogCookie) {
				$(".toolbar-btn-write").remove();
			}
			if (writeBlogCookie) {
				$("#toggle-writeblog-button").prop("checked", true);
			} else {
				$("#toggle-writeblog-button").prop("checked", false);
			}
			config.listenButton("#toggle-writeblog-button", "writeBlog",
							   function() {location.reload();},
							   function() {location.reload();});

			// 右侧滚动条
			/** setTimeout(function () {
				let rightSideHeight = 0;
				let pageHeight = $(window).height();
				rightSideHeight += getHeight($('.align-items-stretch.group_item').parent());
				rightSideHeight += getHeight($("#asideProfile"));
				rightSideHeight += getHeight($("#asideSearchArticle"));
				rightSideHeight += getHeight($("#asideNewArticle"));
				rightSideHeight += getHeight($("#asideHotArticle"));
				rightSideHeight += getHeight($("#asideNewComments"));
				rightSideHeight += getHeight($("#asideCategory"));
				rightSideHeight += getHeight($("#asideArchive"));
				console.debug("Right side total height: " + rightSideHeight);
				console.debug("Page height: " + pageHeight);
				if (rightSideHeight > pageHeight) {
					$('#recommend-right').css("overflow", "scroll");
				}
			}, 1500); */

			// ---- ldpatch 追加功能 ----
			
			// 注入 PicoCss
			let picoCssCookie = config.get("injectPicoCss", true);
			if(picoCssCookie) {
				$('head').append('<link rel="stylesheet" href="https://s4.zstatic.net/ajax/libs/picocss/2.0.6/pico.min.css" integrity="sha512-UXfikgakSZBii5lkvmDCRO+IYWQhTtwMOJ+3EmGEA+oA82kvbSskgw3OI16Jx1kINgF8aqOkYE+c9h4m6muONg==" crossorigin="anonymous" referrerpolicy="no-referrer" />');
				$('head').append(`<style id="csdngreenerldp-pico-style-adjust">#csdn-toolbar, main *:not(code):not(pre) {background-color: var(--pico-background-color) !important; color: var(--pico-color) !important;} 

					#blogColumnPayAdvert .column-group-item, #blogHuaweiyunAdvert .column-group-item {border-color: var(--pico-primary-border);}

				body {background-color: transparent;}
				::marker {display: none; font-size: 0 !important;}</style>`);
				$("#ldptoggle-injectpicocss").prop("checked", true);
			} else {
				$("#ldptoggle-injectpicocss").prop("checked", false);
			}
			config.listenButton("#ldptoggle-injectpicocss", "injectPicoCss",
							   function() {location.reload();},
							   function() {location.reload();});

			// ==== ldpatch 追加功能 ====
		} else if (num === 7) {
			$(".me_r")[1].remove();
		} else if (num === 8) {
			/* $(".article-bar-top").append("<br>");
			$(".article-bar-top").append($(".aside-box-footerClassify").children("dd").html());
			$("dl").each(function (index, element) {
				var key = $(this).children("dt");
				var value = $(this).children("dd").children("span");
				if (key.html().indexOf("原创") != -1) {
					key = $(this).children("dt").children("a")
					value = $(this).children("dd").children("a").children("span");
					addInfo(key, value);
				} else
				if (value.html() != undefined) {
					addInfo(key, value);
				}
			} );
			function addInfo(key, value) {
				var bind = key.html() + "&nbsp;" + value.html() + "&nbsp;&nbsp;";
				$(".article-bar-top").append(bind + " ");
			} */
			$(".blog_container_aside").remove();
			$(".toolbox-left > .profile-attend").remove();

			// 标题消息提醒去除
			let title = document.title.replace(/^\(.*?\)/g, "");
			document.title = title;
			// 评论复制按钮
			$('.comment-box').prepend('<button class="comment-hidden-text" style="display:none">COPY BUTTON</button>');
			$('.new-opt-box.new-opt-box-bg').prepend('<a class="btn btn-report btn-copy" onclick="javascript:$(\'.comment-hidden-text\').attr(\'data-clipboard-text\',$(this).parent().parent().find(\'.new-comment\').text())">复制评论</a><span class="btn-bar"></span>');
			$('.btn-copy').click(function() {
				var clipboard = new ClipboardJS('.comment-hidden-text');
				clipboard.on('success', function(e) {
					console.info('Action:', e.action);
					console.info('Text:', e.text);
					console.info('Trigger:', e.trigger);
					e.clearSelection();
					$('.btn-copy').html('成功');
					setTimeout(function() {
						$('.btn-copy').html('复制评论');
					}, 1000);
				});
				clipboard.on('error', function(e) {
					console.error('Action:', e.action);
					console.error('Trigger:', e.trigger);
					$('.btn-copy').html('失败，请手动复制');
					setTimeout(function() {
						$('.btn-copy').html('复制评论');
					}, 1000);
				});
				$(".comment-hidden-text").click();
				clipboard.destroy();
			});
		} else if (num === 9) {
			// 删除CSDN LOGO悬浮后的二维码
			$(".toolbar-subMenu > img").parent().remove();
		}
	}, 100);
	progressor.incProgress(10);
}

function getHeight(element) {
	let outerHeight = element.outerHeight();
	if (outerHeight === null) {
		return 0;
	}
	return outerHeight;
}

function isFirefox() {
	return navigator.userAgent.indexOf("Firefox") > 0;
}
