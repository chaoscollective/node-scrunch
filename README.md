# Scrunch #

![Scrunch](http://chaoscollective.org/hotlinks/scrunch.png)

Scrunch is an auto-updating javascript combiner for speedy delivery of modular code in node.js. It's super tiny and handles the annoying busy-work that gets in the way when you'd rather be focusing on awesome things.

Scrunch performs 4 handy operations:

```
1. combine multiple javascript files into one.
2. minify the javascript (smaller and faster, but harder to read).
3. send it over the network as compressed gzip/deflate (even faster).
4. watch the original files and auto-update when anything is changed.
```

Now you can start your node.js app, edit your javascript files, and see the scrunched output all rolled together and up-to-date each time you reload the page.

Scrunch is helpful for developing quick node.js apps since it encourages modular code (lots of little, specific javascript libraries that you can use anywhere) without putting tons of script tags in the HTML that make things slow and stringy.

```
scrunch.combine(filepath or array_of_filepaths, options);
 --> returns a function that handles HTTP requests.
```

## How to use Scrunch?

on the server...

```
npm install scrunch
```

```javascript
var scrunch = require('scrunch');

// for any set of files you want to scrunch (while developing)
app.get('/scrunch/allfiles.js', scrunch.combine([
  __dirname+'/file1.js',
  __dirname+'/file2.js',
  __dirname+'/file3.js'
], {
  comment: true,
  refresh: 500,
}));

// then, turn on the minify/compress options for speedy tiny files!
app.get('/scrunch/allfiles2.js', scrunch.combine([
  __dirname+'/file1.js',
  __dirname+'/file2.js',
  __dirname+'/file3.js'
], {
  minifyJS: true,
  compress: true, 
}));
```

in the browser...

```html
<!-- for all files as one, but still readable -->
<script src='/scrunch/allfiles.js'></script>

<!-- or, for speedy tiny files -->
<script src='/scrunch/allfiles2.js'></script>
```

## Options

### comment (default: false)
> when true, adds comment before each file for ease of debugging.

### refresh (default: 5007)
> specifies in milliseconds how often to check for file updates.

### minifyJS (default: false)
> when true, runs the output through Uglify-JS2 to make things small.

### compress (default: false)
> when true, sends the HTTP response as gzip/deflate when possible.

### type (default: 'text/javascript; charset=utf8')
> sets the content-type header for HTTP response.

### maxAge (default: 0)
> sets the max_age in the HTTP response (for browser caching)

## About

This little module was created by [The Chaos Collective](http://chaoscollective.org) and is being shared with the Node.js community as open source. 

Go make awesome things!

