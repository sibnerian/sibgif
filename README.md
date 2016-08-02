# Overview

Re-forked from BuzzFeed's libgif project (https://github.com/buzzfeed/libgif-js), which was forked from the excelent[sic] jsgif project (https://github.com/shachaf/jsgif), which was implemented as a bookmarklet to manipulate animated gifs (http://slbkbs.org/jsgif).

This is an attempt to modernize the async handling of the library (which was not very good), and also to add some features which I found useful, such as exposing the frames object with an optional data URL for each frame.
# Example

See `example.html` for some super basic examples, if you're not familiar with the library.

See `async_example.html` for tips on using this library with [async](http://caolan.github.io/async/).

See `tween_example.html` for a cool application of the library: gifs that play/rewind as you scroll the page.

Please note: examples must be loaded via a webserver, not directly from disk. I.e. http://localhost/sibgif/example.html NOT file:///sibgif/example.html. See the same-domain origin caveat at the bottom of this document for more information. I use [http-server](https://github.com/indexzero/http-server) to do this, and you should too!

There are also hosted demos at http://sibnerian.com/sibgif/examples/example.html, http://sibnerian.com/sibgif/examples/async_example.html, and http://sibnerian.com/sibgif/examples/tween_example.html.

## Class: SuperGif

### Example Usage:

```html
<img id="myImage" src="./example1_preview.gif" data-animated-source="./example1.gif"
	width="360" height="360" data-autoplay="1" />

<!-- load the library -->
<script type="text/javascript" src="js/sibgif.min.js"></script>

<script type="text/javascript">
	var gif = new SuperGif({
		gif: document.getElementById('myImage')
	});
	gif.load(function (err) {
		if (err) {
			console.error(err);
		} else {
			console.log('Yay, the gif loaded!');
		}
	});
</script>
```

### Image tag attributes:

* **data-animated-source** -	If this url is specified, it's loaded into the player instead of src.
					This allows a preview frame to be shown until animated gif data is streamed into the canvas

* **data-autoplay** -		Defaults to 1 if not specified. If set to zero, a call to the play() method is needed

### Constructor options

* **gif**		-		Required. The DOM element of an img tag.
* **loop_mode**	-			Optional. Setting this to false will force disable looping of the gif.
* **auto\_play** -			Optional. Same as the rel:auto_play attribute above, this arg overrides the img tag info.
* **max\_width** -			Optional. Scale images over max\_width down to max_width. Helpful with mobile.
* **on_end** -				Optional. Add a callback for when the gif reaches the end of a single loop (one iteration). The first argument passed will be the gif HTMLElement.
* **loop_delay** -			Optional. The amount of time to pause (in ms) after each single loop (iteration).
* **show_progress_bar** - Optional. Setting this to false will disable the loading progress bar.
* **progressbar_height** -			Optional. The height (in px) of the progress bar. Default: 25.
* **progressbar_background_color** -			Optional. The background color of the progress bar. Default: `'rgba(255,255,255,0.4)'`.
* **progressbar_foreground_color** -			Optional. The foreground color of the progress bar. Default: `rgba(255,0,22,.8)'`.
* **includeDataURL** -										Optional. Setting this to true will include the dataURL property in each frame object.

### Instance methods

#### loading
* **load(callback)** -	Loads the gif specified by the src or rel:animated_src sttributie of the img tag into a canvas element and then calls callback if one is passed
* **load_url(src, callback)** -	Loads the gif file specified in the src argument into a canvas element and then calls callback if one is passed

#### play controls
* **play** -				Start playing the gif
* **pause** -				Stop playing the gif
* **move_to(i)** -		Move to frame i of the gif
* **move_relative(i)** -	Move i frames ahead (or behind if i < 0)

#### getters
* **get_canvas** - The canvas element that the gif is playing in. Handy for assigning event handlers to.
* **get_frames** - The list of frames objects, containing an `ImageData` instance, a dataURL string, and a `delay` amount.
	- **frame object**
		+ *data* - an `ImageData` instance for the frame
		+ *dataURL* - a dataURL for this image. Can be loaded into an HTLM `<img>` DOM element. Only present if the **includeDataURL** constructor option is set.
		+ *delay* - the delay for this frame
* **get_playing** - Whether or not the gif is currently playing
* **get_loading** - Whether or not the gif has finished loading/parsing
* **get\_auto_play** - Whether or not the gif is set to play automatically
* **get_length** - The number of frames in the gif
* **get\_current_frame** - The index of the currently displayed frame of the gif

## Caveat: same-domain origin

The gif has to be on the same domain (and port and protocol) as the page you're loading.

The library works by parsing gif image data in js, extracting individual frames, and rendering them on a canvas element. There is no way to get the raw image data from a normal image load, so this library does an XHR request for the image and forces the MIME-type to "text/plain". Consequently, using this library is subject to all the same cross-domain restrictions as any other XHR request.
