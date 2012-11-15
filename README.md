# jquery.liveurl - a facebook attachment clone

This plugin enables a **live preview** for an url in a *textarea*,
like the facebook attachement<br/> of a post. Multiple images and a video preview is in this demo integrated.

## Installation
Include this script **after** the jQuery library
    <script src="/path/to/jquery.liveurl.js"></script>


## Quick Usage
You can use this plugin on every textarea. Start it directly:

```javascript
$('textarea').liveUrl({
  success : function(data) 
  {  
    console.log(data);
    // this return the first founded url data
  }
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

| Option | Parameter | Default |  Description |
| ------------- | ------------- |------------- | ------------- |
| *findLogo* | `[boolean (true / false)]` | `false` |  should search for an image or class namend "logo" for the image preview |  
| *matchNoData* | `[boolean (true / false)]` | `true`  |  preview urls, which are not founded (offline, 404) |  
| *multipleImages* | `[boolean (true / false)]` | `true`  |  preview more than one  image of the url  | 
| *minWidth* | `[Integer]` | `100`  |  Value in pixel for the minimum width of each preview-image  | 
| *minHeight* | `[Integer]` | `32`  |  Value in pixel for the minimum height of each preview-image  | 

## Development

- Source hosted at [GitHub](https://github.com/stephan-fischer/jQuery-LiveUrl)
- Report issues, questions, feature requests on [GitHub Issues](https://github.com/stephan-fischer/jQuery-LiveUrl/issues)

## Authors

[Stephan Fischer](https://github.com/stephan-fischer)
