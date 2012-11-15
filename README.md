# jquery.liveurl - a facebook attachment clone

This plugin enables a **live preview** for an url in a *textarea*,
like the facebook attachement<br/> of a post. Multiple images and a video preview is in this demo integrated.

## Installation
Include this script **after** the jQuery library
    <script src="/path/to/jquery.liveurl.js"></script>


## Usage
You can use this plugin on every textarea. Start it directly:

<pre>
$('textarea').liveUrl({
  success : function(data) 
  {  
    console.log(data);
    // this return the first founded url data:

    /*
      Object {
        title: "New Car Quotes, Buy Used Cars, and Prices | The cars.com alternative  | Car.com", 
        description: "Car Reviews, Car Financing, and a Free non-obligat…e. Buy or finance your next car or truck with us.", 
        url: "http://www.car.com", 
        video: null
      }
    */

  }
});
</pre>


## Configuration

## Development

- Source hosted at [GitHub](https://github.com/stephan-fischer/jQuery-LiveUrl)
- Report issues, questions, feature requests on [GitHub Issues](https://github.com/stephan-fischer/jQuery-LiveUrl/issues)

## Authors

[Stephan Fischer](https://github.com/stephan-fischer)
