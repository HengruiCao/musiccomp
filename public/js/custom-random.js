//Reference from http://michalbe.blogspot.hk/2011/02/javascript-random-numbers-with-custom_23.html

var CustomRandom = function(nseed) {    
  var seed,    
    constant = Math.pow(2, 13)+1,    
    prime = 1987,    
//any prime number, needed for calculations, 1987 is my favorite:)  
    maximum = 1000;    
//maximum number needed for calculation the float precision of the numbers (10^n where n is number of digits after dot)  
    if (nseed) { 
      seed = nseed;    
    }        
    if (seed == null) {    
//before you will correct me in this comparison, read Andrea Giammarchi's text about coercion http://goo.gl/N4jCB  
      
      nseed = seed = (new Date()).getTime();   
//if there is no seed, use timestamp     
    }     
    
    return {    
      getSeed : function () {return nseed;},
      next : function(min, max) {

        // aded line:
        while (seed > constant) seed /= prime;    
        
        seed *= constant;    
        seed += prime;    
                
        return (min != undefined && max != undefined) ? min+seed%maximum/maximum*(max-min) : seed%maximum/maximum;  
      // if 'min' and 'max' are not provided, return random number between 0 & 1  
      },
      nextInt : function (min, max)
      {
        return Math.floor(this.next(min, max));
      }, 
      nextElement : function(ary)
      {
        return ary[this.nextInt(0, ary.length)];
      }   
    }    
}