var path = require('path');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

url =
  'https://www.acropedia.org/poses/?_sft_position=l-base';

request(url, function(error, response, html) {
  if (error) return;

  var $ = cheerio.load(html);

  var json = [];
  var pagePromises = [];
  var posePromises = [];

  $('.pagination a').each(function() {
    getPoses($(this).attr('href'));
  });

  function getPoses(url) {
    pagePromises.push(
      new Promise(suc => {
        request(url, function(
          error,
          response,
          html
        ) {
          $('.post-item .caption a').each(
            function() {
              var href = $(this).attr('href');

              posePromises.push(
                new Promise(suc => {
                  request(
                    href,
                    (error, response, html) => {
                      var $ = cheerio.load(html);

                      var fields = {
                        img: $(
                          '.tiled-gallery-item img'
                        ).attr('data-orig-file'),
                        title: $(
                          '.breadcrumb_last').text()
                        
                      };

                      $(
                        '.acro-meta-fields tr'
                      ).each(function() {
                        fields[
                          $(this)
                            .find('.label')
                            .text()
                        ] = $(this)
                          .find('.data')
                          .text();
                      });

                      json.push(fields);
                      suc();
                    }
                  );
                })
              );

              suc();
            }
          );
        });
      })
    );
  }

  Promise.all(pagePromises)
    .then(() => {
      return Promise.all(posePromises);
    })
    .then(() => {
      fs.writeFile(
        'output.json',
        JSON.stringify(json, null, 4),
        function(err) {
          console.log(
            'File successfully written! - Check your project directory for the output.json file'
          );
        }
      );
    });
});
