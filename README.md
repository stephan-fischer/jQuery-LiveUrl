# jquery.liveurl - a facebook attachment clone (version 1.2.2)

This plugin enables a **live preview** for an url in a *textarea*,
like the facebook attachment<br/> of a post. Multiple images and a video preview is in this demo integrated.

## Features
 + Filters urls and images from a textarea
 + Multiple Images
 + Video Preview
 + NO PHP required (YQL)
 + Meta Tag Recognition
 + Body Images Inspector
 + Body Paragraphs Inspector for Description Fallback
 

## Demo
**Online-Demo:** http://liveurl.ainetworks.de/demo/

[![](http://25.media.tumblr.com/tumblr_mdiyp1bDim1rl9djro1_1280.png)](http://25.media.tumblr.com/tumblr_mdiyp1bDim1rl9djro1_1280.png)

## Installation
Include this script **after** the jQuery library
```html
  <script src="/path/to/jquery.liveurl.js"></script>
```

## Browser Compatibility
 + Google Chrome 23
 + Mozilla Firefox 16.0.2
 * Internet Explorer 7, 8 and 9
 + Safari 5.1.7

## Quick Usage
You can use this plugin on every textarea. Start it directly:

```javascript
$('textarea').liveUrl({
  success : function(data) 
  {  
    console.log(data);
    // this return the first found url data
  }
});
```
## By Convention Usage
Since most of the time the preview is quite standar, in behavoir and structure, you can define a HTML structure following this convention, instead of redefine the success option, that could be little harder.
In this case you need to define the 'target' attribute so the link-preview will look inside that element as a container and populate the preview on it.

```javascript
'<div id="link-preview-container">' +
  '<div class="liveurl-loader"></div>' +
  '<div class="liveurl">' +
    '<div class="close" title="Entfernen"></div>' +
    '<div class="inner">' +
      '<div class="image"> </div>' +
      '<div class="details">' +
        '<div class="info">' +
          '<div class="title"> </div>' +
          '<div class="description"> </div> ' +
          '<div class="url"> </div>' +
        '</div>' +
        '<div class="thumbnail">' +
          '<div class="pictures">' +
            '<div class="controls">' +
              '<div class="prev button inactive"></div>' +
              '<div class="next button inactive"></div>' +
              '<div class="count">' +
                '<span class="current">0</span><span> von </span><span class="max">0</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="video"></div>' +
      '</div>' +
    '</div>' +
  '</div>' +
'</div>';

$('textarea').liveUrl({
  target: $('#link-preview-container')
});
```

## Template Usage
If you need to create more than one preview, but you still want to use the HTML structure instead of success, you can define the 'template' attribute following the same conventions:
```javascript
var myTemplate =
  '<div class="liveurl-loader"></div>' +
  '<div class="liveurl">' +
    '<div class="close" title="Entfernen"></div>' +
    '<div class="inner">' +
      '<div class="image"> </div>' +
      '<div class="details">' +
        '<div class="info">' +
          '<div class="title"> </div>' +
          '<div class="description"> </div> ' +
          '<div class="url"> </div>' +
        '</div>' +
        '<div class="thumbnail">' +
          '<div class="pictures">' +
            '<div class="controls">' +
              '<div class="prev button inactive"></div>' +
              '<div class="next button inactive"></div>' +
              '<div class="count">' +
                '<span class="current">0</span><span> von </span><span class="max">0</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="video"></div>' +
      '</div>' +
    '</div>' +
  '</div>';

$('textarea').liveUrl({
  template: myTemplate,
  target: $('.link-preview-container')
});
```
### returns: ###
```javascript
Object = {
    title: "New Car Quotes, Buy Used Cars, and Prices | The cars.com alternative  | Car.com", 
    description: "Car Reviews, Car Financing, and a Free non-obligat…e.", 
    url: "http://www.car.com", 
    video: null
}
```

## Options

| Option            | Parameter                  | Default       | Description                                                                                      |
| -------------     | -------------              | ------------- | -------------                                                                                    |
| *findLogo*        | `[boolean (true / false)]` | `false`       | should search for an image or class namend "logo" for the image preview                          |
| *logoWord*        | `[string]`                 | `logo`        | Word, which should be searched, used for the "findLogo" option                                   |
| *findDescription* | `[boolean (true / false)]` | `true`        | should search for an p tag with text, only if the description is not given                       |
| *matchNoData*     | `[boolean (true / false)]` | `true`        | preview urls, which are not found (offline, 404)                                                 |
| *multipleImages*  | `[boolean (true / false)]` | `true`        | preview more than one  image of the url                                                          |
| *minWidth*        | `[integer]`                | `100`         | Value in pixel for the minimum width of each preview-image                                       |
| *minHeight*       | `[integer]`                | `32`          | Value in pixel for the minimum height of each preview-image                                      |
| *loadStart*       | `[function()]`             | `{}`          | This function starts if the plugin start a page download - for an optional loader                |
| *loadEnd*         | `[function()]`             | `{}`          | This function starts if the plugin has finished the page download                                |
| *success*         | `[function()]`             | `{data}`      | Returns the information about the first found url                                                |
| *addImage*        | `[function()]`             | `{image}`     | This function is started each time, if a picture is found                                        |
| *imgLoadStart*    | `[function()]`             | `{}`          | Not implemented                                                                                  |
| *imgLoadEnd*      | `[function()]`             | `{}`          | Not implemented                                                                                  |
| *template*        | `[boolean (true / false)]` | `false`       | The HTML structure that will be added into the 'target' element. 'target' attr has to be defined |
| *targat*          | `[boolean (true / false)]` | `false`       | The jQuery element in which the link preview will be rendered                                    |
| *encodingSafe*    | `[boolean (true / false)]` | `false`       | This flag will determine if the title and description will be html decoded                       |

## Development

- Source hosted at [GitHub](https://github.com/stephan-fischer/jQuery-LiveUrl)
- Report issues, questions, feature requests on [GitHub Issues](https://github.com/stephan-fischer/jQuery-LiveUrl/issues)

## Authors

[Stephan Fischer](https://github.com/stephan-fischer)


## Donation
If you want to support me, make a small donation  at www.paypal.com: stephan@ainetworks.de
