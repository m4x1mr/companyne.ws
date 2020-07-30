mybutton = document.getElementById("myBtn");
// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () { scrollFunction() };

function scrollFunction() {
    if (document.body.scrollTop > 60 || document.documentElement.scrollTop > 60) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

//grabs the newslist div
const searchForm = document.querySelector('.search');
searchForm.addEventListener('submit', retrieve);
const input = document.querySelector('.input');
const newsList = document.querySelector('.news-list');
const chips = document.createElement('div');
chips.classList.add('chips');

/*
    Clear all the news on the page, add the class for the chips
*/
function clearNews() {
    newsList.innerHTML = '';
    chips.innerHTML = '';
    newsList.appendChild(chips);
}

/*
    Display news from the Search query
*/
async function retrieve(e) {
    clearNews();
    e.preventDefault();

    var h3 = document.createElement('h3');

    let topic = input.value;

    if (topic == '') {
        getAllNews();
    } else {
        getChips();
        getNews(topic);
    }
}

/*
    Gather Data from the google sheet
*/
async function getSheetsData() {
    clearNews();
    //await the response of the fetch call
    let url = 'https://spreadsheets.google.com/feeds/cells/1WI8Me3mMDfxQDq8c20Cbk9HZHG8lMALyVTrxyntqwgg/od6/public/basic?alt=json';
    try {
        response = await fetch(url);
        data = await response.json()
    } catch (error) {
        console.log(error);
    }
    return data.feed.entry;
}

/*
    Display all news onload of the site
*/
async function getAllNews() {
    //waits to fill companies with return from other function
    const companies = await getSheetsData();
    //for each company, we're getting the chips and the articles for each
    for (const comp of companies) {
        let topic = comp.content.$t;//Each topic is the company name
        getChips(topic);
        getNews(topic);
    }
}

/*
    Create the chips/minicards for the companies and the back button
*/
async function getChips(value) {
    var chipText = document.createElement('h4');//create the element for each chip text
    var chip = document.createElement('div');//each chip is held in a div
    var chipLink = document.createElement('a');//each chip is made out of an A tag with an href to an ID
    chip.classList.add('chip');//add the class

    //if there's a value, do this, if not do the back button
    if (value) {
        chipLink.setAttribute('href', '#' + value); //set the anchor
        chipText.textContent = value; //sets the subheading text to the companies' names  
    } else {
        chipLink.setAttribute('href', 'javascript:;');
        chipLink.setAttribute('onClick', 'getAllNews();');
        chipLink.setAttribute('id', 'gohome');
        chipText.textContent = '← Return Home';
    }

    //build the chip
    chips.appendChild(chipLink);
    chipLink.appendChild(chip);
    chip.appendChild(chipText);
}

/*
    Connect to the Gnews api
*/
function getNews(topic) {
    var div = document.createElement('div');//this is the div that holds each news list
    var h3 = document.createElement('h3');//these are subheadings for each news list
    var error_text = document.createElement('h1');//these are subheadings for each news list
    div.setAttribute('id', topic);
    div.classList.add('company-news');

    //build out the news list headings                
    h3.textContent = topic; //sets the subheading text to the companies' names
    newsList.appendChild(div);
    div.appendChild(h3);
    //c3add341256eba19d065d37cf36b8cd6
    //fb7a02aa4ae9237a19c62f1378f9ad6f
    let url = `https://gnews.io/api/v3/search?q=${topic}&token=c3add341256eba19d065d37cf36b8cd6`;

    fetch(url).then(response => {
        return response.json();
    }).then(data => {

        if (data.articleCount < 1) {
            error_text.classList.add('error-text');
            error_text.textContent = 'No news articles were found for ' + topic;
            div.appendChild(error_text);

        } else {
            //we're building out each list item for each article here
            for (const element of data.articles) {
                var article = document.createElement('li'); //each article
                var text = document.createElement('div'); //holds all the text (i.e: heading, desc...)
                var caption = document.createElement('p'); //for the source and time
                var desc = document.createElement('p'); //for the description
                var title = document.createElement('h1');
                var link = document.createElement('a');
                var imgwrap = document.createElement('div');
                var img = document.createElement('img');

                imgwrap.classList.add('imgwrap');

                //sets the href to the url of the article
                link.setAttribute('href', element.url);
                link.setAttribute('target', '_blank');
                img.setAttribute('src', element.image)

                //sets p's content to name of source
                caption.textContent = element.source.name + ' ― ' + moment(element.publishedAt).fromNow();
                //the content in h1 style is the title
                title.textContent = element.title;
                desc.textContent = element.description;

                //div contains all of these items --> div(a(li(p, h))))
                div.appendChild(link);
                //the list items are placed inside the a tag --> a(li)
                link.appendChild(article);
                //p and h are placed inside the list item --> a(li(p, h))
                text.appendChild(caption);
                text.appendChild(title);
                text.appendChild(desc);

                article.appendChild(text);

                //if there is an image, add it
                if (element.image) {
                    imgwrap.appendChild(img);
                    article.appendChild(imgwrap);
                }
            }
        }
    })
}

getAllNews();