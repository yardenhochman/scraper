let path = require('path');
let fs = require('fs');
let request = require('request');
let cheerio = require('cheerio');

url = 'https://www.acropedia.org/poses/?_sft_position=l-base';

let json = [];
let pagePromises = [];
let posePromises = [];

const getPoses = url => {
  pagePromises.push(
    new Promise(suc => {
      request(url, (error, response, html) => {
        let $ = cheerio.load(html);
        $('.post-item .caption a').each(function() {
          let href = $(this).attr('href');
          //url of pages 3,4,2
          posePromises.push(
            new Promise(suc => {
              request(href, (error, response, html) => {
                //href = address of poses, html = body of page
                let $ = cheerio.load(html);
                let fields = {
                  img: $('.tiled-gallery-item img, .entry-content img').attr('data-orig-file'),
                  title: $('.breadcrumb_last').text(),
                };

                $('.acro-meta-fields tr').each(function() {
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
              });
            }),
          );

          suc();
        });
      });
    }),
  );
};

request(url, function(error, response, html) {
  if (error) return;

  let $ = cheerio.load(html);
  getPoses(url);
  $('.pagination a').each(function() {
    getPoses($(this).attr('href'));
    //url of pages 3,4,2
  });

  Promise.all(pagePromises)
    .then(() => {
      return Promise.all(posePromises);
    })
    .then(() => {
      fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err) {
        console.log('File successfully written! - Check your project directory for the output.json file');
      });
    });
});
