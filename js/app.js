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
    
    const getData = (url) => {

        $.ajax({
            type: 'POST',
            url: url,
            
            success: function(data, status, xhr){
                $('.js-results-list').empty().append(buildList(data))  // czyszczenie 
                $('.js-results-header').empty().append(buildHeader())
            }, 

            error: function(wrong){
                alert("Problem z pobraniem danych");
            }
        })
    }
    getData(generateUrl());
        
    $(document).on('click', '.js-sort', function(e){ // ominięcie przeładowania do nowej strony przez onlcick. Przeniesienie nazwy klasy do funkcji 
        e.preventDefault();
        currentState.sortColumn = $(this).data('column')
        const url = $(this).attr("href")
       
        getData(url);  
    })
    
    
//    filter
    
    $('.js-search-form').on('submit', function(e){
        e.preventDefault();
        currentState.filter = $('.js-search-form-filter').val()
        currentState.page = 1
        getData(generateUrl());   
    })
    
//    prev button
    
    $('.js-prev').on('click', function(e){
        e.preventDefault();
        if( currentState.page > 1){
            currentState.page--;   
        }
        getData(generateUrl());  
    })
   
  //    next button  
    
     $('.js-next').on('click', function(e){
        e.preventDefault(); 
        currentState.page++; 
        getData(generateUrl());   
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
