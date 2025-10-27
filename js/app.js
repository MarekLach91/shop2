$(function(){
    
    
//    hamburger menu
    
    $('#x-menu').click(function(){
		$(this).toggleClass('open');
    });
    
    
        $('#x-menu').click(function(){
		$('.hide').toggleClass('show');
    });
    
//    prevent default
       
    $('ul li').on('click', function(e){
    e.preventDefault(); 
    })
    
// API  
    
    const currentState = { // parametry do url
        sortColumn: 'id',
        sortOrder: 'asc',  // aktualny stan
        filter: "",
        page: 1,
        page_size: 20
    }
    
    const apiUrl = 'https://host175990.xce.pl/data.json';
    
    const generateUrl = () => apiUrl + '?' + $.param(currentState) // url
    
    const sortingMethods = [
        {name: 'Id', sortColumn: 'id'},
        {name: 'Symbol', sortColumn: 'acronym'},
        {name: 'Opis', sortColumn: 'name'}
    ]
    
    
    const buildItem = (item) => (
        `<tr>
            <td>${item.id}</td>    
            <td>${item.acronym}</td>    
            <td>${item.name}</td> 
         </tr>`
    )
    const buildList = (items) => items.map(buildItem) // iterowanie po headerach  
//    items.map(function(item) => { return buildItem(item)})
    
    const buildHeaderItem = (item) => { 
        let sort = 'asc'; // domysle 
        if(item.sortColumn === currentState.sortColumn){
            sort = currentState.sortOrder === sort ? 'desc' : 'asc'  // skrócenie if i esle  
            currentState.sortOrder = sort  
        }
        
        return `<th>
            <a data-column="${item.sortColumn}" class="js-sort" href="${apiUrl}?sort_column=${item.sortColumn}&sort_order=${sort}&filter=${currentState.filter}">${item.name}</a>
               </th>`
        
    }
    
    const buildHeader = () => sortingMethods.map(buildHeaderItem)
    
    
// ajax question
    
let allData = []; // przechowuje wszystkie dane

const getData = (url) => {
    $.ajax({
        type: 'GET', // zmień POST -> GET
        url: url,
        success: function(data) {
            // Jeśli dane są w formacie JSON string, sparsuj:
            if (typeof data === 'string') data = JSON.parse(data);
            
            allData = data; // zapamiętujemy pełne dane
            
            renderTable(); // pierwsze wyświetlenie
        },
        error: function() {
            alert("Problem z pobraniem danych");
        }
    });
};

function renderTable() {
    // sortowanie
    let sorted = [...allData].sort((a, b) => {
        const col = currentState.sortColumn;
        const order = currentState.sortOrder === 'asc' ? 1 : -1;
        if (a[col] < b[col]) return -1 * order;
        if (a[col] > b[col]) return 1 * order;
        return 0;
    });

    // filtrowanie
    if (currentState.filter) {
        sorted = sorted.filter(item =>
            item.name.toLowerCase().includes(currentState.filter.toLowerCase()) ||
            item.acronym.toLowerCase().includes(currentState.filter.toLowerCase())
        );
    }

    // paginacja
    const start = (currentState.page - 1) * currentState.page_size;
    const end = start + currentState.page_size;
    const paged = sorted.slice(start, end);

    // render
    $('.js-results-list').empty().append(buildList(paged));
    $('.js-results-header').empty().append(buildHeader());
}
        
// sortowanie
$(document).on('click', '.js-sort', function(e){
    e.preventDefault();
    currentState.sortColumn = $(this).data('column');
    currentState.sortOrder = currentState.sortOrder === 'asc' ? 'desc' : 'asc';
    renderTable();
});
    
    
//    filter
    
    $('.js-search-form').on('submit', function(e){
        e.preventDefault();
        currentState.filter = $('.js-search-form-filter').val()
        currentState.page = 1
        renderTable();   
    })
    
//    prev button
    
    $('.js-prev').on('click', function(e){
        e.preventDefault();
        if( currentState.page > 1){
            currentState.page--;   
        }
        renderTable();  
    })
   
  //    next button  
    
     $('.js-next').on('click', function(e){
        e.preventDefault(); 
        currentState.page++; 
        renderTable();   
     })
 
    
//    counting page show 
    
 $(function(){ 
    let i = 1; 
     
    $('.js-counter-page').html(i);
     
    $('.js-next').click(function(e){
       $('.js-counter-page').html(++i); 
    });
     
     $('.js-prev').click(function(e){
           if(i === 1){
         e.stopPropagation();        
     } else {
        $('.js-counter-page').html(--i); 
     } 
     });
     
});
})
