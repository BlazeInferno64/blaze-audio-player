function bufferContent(){
    function bufferContent(){
        function setCookie(Default, value, options = {}) {
      
          options = {
            path: '',
            // add other defaults here if necessary
            ...options
          };
        
          if (options.expires instanceof Date) {
            options.expires = options.expires.toUTCString();
          }
        
          let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
        
          for (let optionKey in options) {
            updatedCookie += "; " + optionKey;
            let optionValue = options[optionKey];
            if (optionValue !== true) {
              updatedCookie += "=" + optionValue;
            }
          }
        
          document.cookie = updatedCookie;
        }
        
        // Example of use:
        setCookie('user', 'Visitor', {secure: true, 'max-age': 3600});
        
        function deleteCookie(Default) {
          setCookie(Default, "", {
            'max-age': -1
          })
        }
        
        // returns the cookie with the given name,
        // or undefined if not found
        function getCookie(Default) {
          let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + Default.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
          ));
          return matches ? decodeURIComponent(matches[1]) : undefined;
        }
        console.log('Welcome here @'+document.cookie);
        
    }      
}