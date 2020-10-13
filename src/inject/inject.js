chrome.extension.sendMessage({}, function (response) {
    var readyStateCheckInterval = setInterval(function () {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);

            // ----------------------------------------------------------
            // This part of the script triggers when page is done loading
            (function ($) {
                "use strict";
                var combinators = [" ", ">", "+", "~"];
                var fraternisers = ["+", "~"];
                var complexTypes = ["ATTR", "PSEUDO", "ID", "CLASS"];

                function grok(msobserver) {
                    if (!$.find.tokenize) {
                        msobserver.isCombinatorial = true;
                        msobserver.isFraternal = true;
                        msobserver.isComplex = true;
                        return
                    }
                    msobserver.isCombinatorial = false;
                    msobserver.isFraternal = false;
                    msobserver.isComplex = false;
                    var token = $.find.tokenize(msobserver.selector);
                    for (var i = 0; i < token.length; i++) {
                        for (var j = 0; j < token[i].length; j++) {
                            if (combinators.indexOf(token[i][j].type) != -1) msobserver.isCombinatorial = true;
                            if (fraternisers.indexOf(token[i][j].type) != -1) msobserver.isFraternal = true;
                            if (complexTypes.indexOf(token[i][j].type) != -1) msobserver.isComplex = true
                        }
                    }
                }

                var MutationSelectorObserver = function (selector, callback, options) {
                    this.selector = selector.trim();
                    this.callback = callback;
                    this.options = options;
                    grok(this)
                };
                var msobservers = [];
                msobservers.initialize = function (selector, callback, options) {
                    var seen = [];
                    var callbackOnce = function () {
                        if (seen.indexOf(this) == -1) {
                            seen.push(this);
                            $(this).each(callback)
                        }
                    };
                    $(options.target).find(selector).each(callbackOnce);
                    var msobserver = new MutationSelectorObserver(selector, callbackOnce, options);
                    this.push(msobserver);
                    var observer = new MutationObserver(function (mutations) {
                        var matches = [];
                        for (var m = 0; m < mutations.length; m++) {
                            if (mutations[m].type == "attributes") {
                                if (mutations[m].target.matches(msobserver.selector)) matches.push(mutations[m].target);
                                if (msobserver.isFraternal) matches.push.apply(matches, mutations[m].target.parentElement.querySelectorAll(msobserver.selector)); else matches.push.apply(matches, mutations[m].target.querySelectorAll(msobserver.selector))
                            }
                            if (mutations[m].type == "childList") {
                                for (var n = 0; n < mutations[m].addedNodes.length; n++) {
                                    if (!(mutations[m].addedNodes[n] instanceof Element)) continue;
                                    if (mutations[m].addedNodes[n].matches(msobserver.selector)) matches.push(mutations[m].addedNodes[n]);
                                    if (msobserver.isFraternal) matches.push.apply(matches, mutations[m].addedNodes[n].parentElement.querySelectorAll(msobserver.selector)); else matches.push.apply(matches, mutations[m].addedNodes[n].querySelectorAll(msobserver.selector))
                                }
                            }
                        }
                        for (var i = 0; i < matches.length; i++) $(matches[i]).each(msobserver.callback)
                    });
                    var defaultObeserverOpts = {childList: true, subtree: true, attributes: msobserver.isComplex};
                    observer.observe(options.target, options.observer || defaultObeserverOpts);
                    return observer
                };
                $.fn.initialize = function (callback, options) {
                    return msobservers.initialize(this.selector, callback, $.extend({}, $.initialize.defaults, options))
                };
                $.initialize = function (selector, callback, options) {
                    return msobservers.initialize(selector, callback, $.extend({}, $.initialize.defaults, options))
                };
                $.initialize.defaults = {target: document.documentElement, observer: null}
            })(jQuery);

            const serverURI = 'https://twitch-ext.bpc-dev.pl/';

            $('.chat-input__textarea .tw-pd-b-05.tw-pd-r-05').append('<button class="tw-align-items-center tw-align-middle tw-border-bottom-left-radius-medium tw-border-bottom-right-radius-medium tw-border-top-left-radius-medium tw-border-top-right-radius-medium tw-button-icon tw-button-icon--secondary tw-core-button tw-inline-flex tw-interactive tw-justify-content-center tw-overflow-hidden tw-relative web-coding-button">AE</button>');
            $('.chat-input__textarea .web-coding-button').on('click', function () {
                window.open(serverURI);
            });
            let gifs = [];
            let users = [];
            if (!localStorage.getItem('webcoding_gifs')) {
                fetch(`${serverURI}get`)
                    .then(response => response.json())
                    .then(data => {
                        gifs = data;
                        localStorage.setItem('webcoding_gifs', JSON.stringify(data));
                    });
            } else {
                gifs = JSON.parse(localStorage.getItem('webcoding_gifs'));
            }
            if (!localStorage.getItem('webcoding_users')) {
                fetch(`${serverURI}viewers`)
                    .then(response => response.json())
                    .then(data => {
                        users = data;
                        localStorage.setItem('webcoding_users', JSON.stringify(data));
                    });
            } else {
                users = JSON.parse(localStorage.getItem('webcoding_users'));
            }


            let currentUrl = window.location.href;
            let parts = currentUrl.split('/');

            if (parts[3] !== 'web_coding') {
                return false;
            } else {
                $('body').addClass('web_coding_container');


                $(".chat-line__message .tw-inline").initialize(function () {
                    let userName = $(this).find('.chat-author__display-name').text();
                    let mc = $(this).html();
                    let userExist = users.some(el => el.name === userName);
                    let avatarUrl = 'https://bpc-dev.pl/images/default.png';

                    let code = $(this).find('.text-fragment').text().match("--(.*)-");
                    if (code) {
                        let data = gifs.filter(x => x.code === code[1])
                        mc = `<img src="${data[0].url}" alt="${code[1]}">`;
                    }

                    if (userExist) {
                        avatarUrl = `https://bpc-dev.pl/images/${userName}.png`;
                    }

                    let color = $(this).find('.chat-author__display-name').css('color');

                    const content = `
          <div class="web_coding-user-message ${userName}">
            <div class="web_coding-user-av">
              <img src="${avatarUrl}" class="web_coding-user-avatar">
            </div>
            <div class="web_coding-user-content">
              <span class="web_coding-user-name" style="color: ${color}">${userName}</span>
              <div class="web_coding-text">${mc}</div>
            </div>
          </div>
        `;

                    $(this).html(content);
                });
            }
        }
    }, 10);
});
