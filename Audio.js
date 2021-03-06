/**
 * [Audio 播放库]
 * 总时长，当前时长，开始，暂停，结束，进度，跳转， 音量
 */
;(function(root, factory) {
    var AudioComponent = factory(root);
    if (typeof define === 'function' && define.amd) {
        // AMD
        define('AudioComponent', function() {
            return AudioComponent;
        });
    } else if (typeof exports === 'object') {
        // Node.js
        module.exports = AudioComponent;
    } else {
        // Browser globals
        var _AudioComponent = root.AudioComponent;

        AudioComponent.noConflict = function() {
            if (root.AudioComponent === AudioComponent) {
                root.AudioComponent = _AudioComponent;
            }
            return AudioComponent;
        };
        root.AudioComponent = AudioComponent;
    }
}(this, function(root) {
	// object copy
	function $extend(primaryObject, secondaryObject) {
		var o = {};
		for (var prop in primaryObject) {
			o[prop] = secondaryObject.hasOwnProperty(prop) ? secondaryObject[prop] : primaryObject[prop];
		}
		return o;
	};
	// 事件绑定
	function addEvent(el, eType, handle, bool) {
		if(el.addEventListener) {
			el.addEventListener(eType, handle, bool);
		} else if(el.attachEvent) {
			el.attachEvent('on' + eType, handle);
		} else {
			el['on' + eType] = handle;
		}
	};
	// 事件解绑
	function removeEvent(el, eType, handle, bool) {
		if(el.addEventListener) {
			el.removeEventListener(eType, handle, bool);
		} else if(el.attachEvent) {
			el.detachEvent('on' + eType, handle);
		} else {
			el['on' + eType] = null;
		}
	};
	// 默认参数
	var settings = {
		// audio 属性
		id: '', 						// audio id
		src: '', 						// audio 源地址
		autoplay: false, 				// 是否自动播放
		loop: false, 					// 是否循环播放
		controls: false, 				// 是否显示播放控件
		preload: true, 				// 是否在页面加载时进行加载，并预备播放 (如果使用"autoplay"，则忽略该属性)
		// 回调
		loadstartFn: null, 				// load start 回调
		loadedFn: null, 				// laoded 回调
		progressFn: null, 				// 播放中 回调
		endFn: null 					// 播放结束 回调
	};
	function AudioComponent(options) {
		this.opts = $extend(settings, options);
		this.duration = 0;
	}
	AudioComponent.prototype = {
		constructor: AudioComponent,
		init: function() {
			this.createEl();
			this.onloadstart();
			this.onLoaded();
			this.onPlaying();
			this.onEnd();
		},
		// 创建 audio
		createEl: function() {
			var audio = document.createElement('audio');
			audio.id = this.opts.id;
			audio.src = this.opts.src;
			audio.autoplay = this.opts.autoplay;
			audio.loop = this.opts.loop;
			audio.controls = this.opts.controls;
			audio.preload = this.opts.preload;
			document.body.appendChild(audio);
			this.audio = audio;
		},
		// 获取 audio 源地址
		getSrc: function() {
			return this.audio.getAttribute('src');
		},
		// 设置 audio 源地址
		setSrc: function(src) {
			var audio = this.audio;
			audio.setAttribute('src', src);
			audio.play();
		},
		// 获取总时长
		getDuration: function() {
			return this.duration;
		},
		// 获取当前时间
		getCurrentTime: function() {
			return this.audio.currentTime;
		},
		// 播放到设置时间
		setCurrentTime: function(time) {
			var audio = this.audio;
			audio.currentTime = time;
			audio.play();
		},
		// 获取当前播放 百分比
		getPercent: function() {
			return this.getCurrentTime() / this.getDuration();
		},
		// 设置播放百分比 (0.5)
		setPercent: function(val) {
			var time = this.getDuration() * val;
			this.setCurrentTime(time);
		},
		// 播放控制
		playControl: function(playFn, pauseFn) {
			var audio = this.audio;
			var isPause = audio.paused;
			if(isPause) {
				audio.play();
				(playFn && typeof playFn === 'function') && playFn();
				return;
			}
			audio.pause();
			(pauseFn && typeof pauseFn === 'function') && pauseFn();
		},
		// 播放
		play: function(callback) {
			var audio = this.audio;
			audio.play();
			(callback && typeof callback === 'function') && callback(audio.currentTime);
		},
		// 暂停
		pause: function(callback) {
			var audio = this.audio;
			audio.pause();
			(callback && typeof callback === 'function') && callback(audio.currentTime);
		},
		// 静音控制
		muted: function(muteFn, unmuteFn) {
			var audio = this.audio;
			if(audio.muted) {
				audio.muted = false;
				(muteFn && typeof muteFn === 'function') && muteFn();
			} else {
				audio.muted = true;
				(unmuteFn && typeof unmuteFn === 'function') && unmuteFn();
			}
		},
		// 音量调小
		volumeBate: function() {
			var audio = this.audio;
			var volume = audio.volume - 0.1;
			if(volume <= 0) {
				volume = 0;
			}
			audio.volume = volume;
		},
		// 音量调大
		volumeRaise: function() {
			var audio = this.audio;
			var volume = audio.volume + 0.1;
			if(volume >= 1) {
				volume = 1;
			}
			audio.volume = volume;
		},
		// audio 开始加载
		onloadstart: function() {
			var audio = this.audio,
				loadstartFn = this.opts.loadstartFn;
			audio.addEventListener('loadstart', function() {
				(loadstartFn && typeof loadstartFn === 'function') && loadstartFn();
			}, false);
		},
		// audio 加载
		onLoaded: function(loadedFn) {
			var that = this;
			var audio = that.audio,
				loadedFn = that.opts.loadedFn;
			audio.addEventListener('loadeddata', function() {
				that.duration = audio.seekable.end(0);
				(loadedFn && typeof loadedFn === 'function') && loadedFn(that.duration, audio.currentTime, that.audio);
			}, false);
		},
		// 播放中
		onPlaying: function() {
			var that = this;
			var audio = that.audio,
				progressFn = that.opts.progressFn;
			audio.addEventListener('timeupdate', function() {
				(progressFn && typeof progressFn === 'function') && progressFn(that.duration, audio.currentTime);
			}, false);
		},
		// 播放结束
		onEnd: function() {
			var that = this;
			var audio = that.audio,
				endFn = that.opts.endFn;
			audio.addEventListener('ended', function() {
				(endFn && typeof endFn === 'function') && endFn();
			}, false);
		},
		// 支持播放类型
		onCanPlayType: function(type) {
			return this.audio.canPlayType(type);
		}
	}
	return {
		create: function(options) {
			var audio = new AudioComponent(options);
			audio.init();
			return audio;
		}
	}
}));