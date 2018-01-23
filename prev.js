var request = {}
var channelready = false;
var channelgroup = [];
var daterange = [];
var weekrange = [];
var monthrange = [];
var quarterrange = [];
var yearrange =[];
var scrollLen = 0;
var scrollNum = 0;
var periodcheck = false;
var magicType = 'bar';
var activeChannel = 0;
var activePlatForm = 0;
var activeFlag = false;
var clickedCell = 0;
var sort = '000';
var WPeriod = '';
var wto;
var filterexist = false;
var box = '';
var listnum = 0;
var lilength = 0;
var TrendingProgTitleID = 0;
var TrendingChannelGroupID = 0;
var TrendingChannelID = 0;
var TrendingPeriodTypeID = 0;
var TrendingPeriod = 0;
var TrendingPlatFormID = 0;
var TrendingFilter = '';  
var navmodule = {
  /*
  ===== Initialize navigation
  */
  initnav : function(ChannelID,formID,PeriodType){
    if(channelready == false){
      /*
      ===== first step initialize Channel group and show when channel view = Separated
      ===== Ajax req for channel group
      */
      var promise = $.get(window.location.href + "channelgroup", request).then(function(data){
        $('#'+formID).find('option').remove();
        var selectBox = document.getElementById(formID);

        for(var i in data){
          channelgroup.push({ChannelGroupID : data[i].ChannelGroupID, ChannelGroupName : data[i].ChannelGroupName})
          selectBox.options.add(new Option(data[i].ChannelGroupName,  data[i].ChannelGroupID));
        }
        $('#'+formID).val(1000)
        /*
        ===== Ajax request for period range
        ===== initialize period range after the request
        */
        return $.get(window.location.href + "periodrange", request);
      }).then(function(data){
          var counter = 0
          for(var i in data){
            if(data[i].ProgDate != -1){
              switch(counter){
                case 0 :
                  /*
                  ===== default period and default scrollLength
                  */
                  daterange.push(data[i].ProgDate)
                  scrollLen = daterange.length - 1;                  
                  break;
                case 1 :
                  weekrange.push(data[i].ProgDate)                  
                  break;
                case 2 :
                  monthrange.push(data[i].ProgDate)                  
                  break;
                case 3 :
                  quarterrange.push(data[i].ProgDate)                  
                  break;
                case 4 :
                  yearrange.push(data[i].ProgDate)                  
                  break;
              }              
            }else{
              counter++;
            }
          }
          
          daterange.sort(function(a, b){return b-a});
          weekrange.sort(function(a, b){return b-a});
          monthrange.sort(function(a, b){return b-a});
          quarterrange.sort(function(a, b){return b-a});
          yearrange.sort(function(a, b){return b-a});
          for(var i in daterange){
            daterange[i] = navmodule.convertProgdate(daterange[i],1)
          }
          for(var i in weekrange){
            weekrange[i] = navmodule.convertProgdate(weekrange[i],2)
          }
          for(var i in monthrange){
            monthrange[i] = navmodule.convertProgdate(monthrange[i],3)
          }
          for(var i in quarterrange){
            quarterrange[i] = navmodule.convertProgdate(quarterrange[i],4)
          }
          for(var i in yearrange){
            yearrange[i] = navmodule.convertProgdate(yearrange[i],5)
          }
          console.log(daterange)
          console.log(weekrange)
          $('#customperiod').val(daterange[0])

          var ChannelGroupID = $('#channelgroup').val()
          var PeriodTypeID = $('#periodtype').val();
          var Period = daterange[0]

          request = {
            ChannelGroupID : ChannelGroupID,
            PeriodTypeID : PeriodTypeID,
            Period : navmodule.externalProgdate(Period),
          }

          console.log(request)
          navmodule.scrollproperty()
          return $.get(window.location.href + "channelperformance", request);

      }).then(function(data){
        channelready = true;
        //navmodule.init_ChannelPerformance(data,$('#channelgroup').val())
      })
    }
  },
  /*
  ===== change performance
  */
  convertProgdate : function(progdate,ptype){
    progdate = progdate.toString();
    if(ptype == 1){
      var newdate = progdate.substring(6,8)+""+progdate.substring(4,6)+""+progdate.substring(2,4)
    }else if(ptype == 2){
      var newdate = progdate.substring(2,4)+""+progdate.substring(4,6)
    }else if(ptype == 3){
      var char = progdate.substring(4,6)
      if(char.charAt(0) == 0){
        var newdate = progdate.substring(2,4)+"m"+progdate.substring(5,6)
      }else{
        var newdate = progdate.substring(2,4)+"m"+progdate.substring(4,6)
      }      
    }else if(ptype == 4){
      var newdate = progdate.substring(2,4)+"q"+progdate.substring(5,6)
    }else if(ptype == 5){
      var newdate = progdate.substring(2,4)
    } 

    //console.log(newdate)
    return newdate
  },
  externalProgdate : function(progdate){
    progdate = progdate.toString();
    if($('#periodtype').val() == 1){
      var newdate = "20"+progdate.substring(4,6)+""+progdate.substring(2,4)+""+progdate.substring(0,2) 
    }else if($('#periodtype').val() == 2){
      var newdate = "20"+progdate.substring(0,2)+""+progdate.substring(2,4)
    }else if($('#periodtype').val() == 3){
      if(progdate.length == 4){
        var newdate = "20"+progdate.substring(0,2)+"0"+progdate.substring(3,4)
      }else{
        var newdate = "20"+progdate.substring(0,2)+""+progdate.substring(3,5)
      }      
    }else if($('#periodtype').val() == 4){
      var newdate = "20"+progdate.substring(0,2)+"0"+progdate.substring(3,4)
    }else if($('#periodtype').val() == 5){
      var newdate = "20"+progdate.substring(0,2)
    }        
    //console.log(newdate)
    return newdate
  },
  ChannelPerformanceRequest : function(){
    var ChannelGroupID = $('#channelgroup').val()
    var PeriodTypeID = $('#periodtype').val();
    if(WPeriod != ''){
      var Period = WPeriod
    }else{
      var Period = navmodule.externalProgdate($('#customperiod').val())
    }
    
    if(filterexist == true){
      var filter = $('#filterbmi').val()
    }else{
      var filter = ''
    }
    request = {
      ChannelGroupID : ChannelGroupID,
      PeriodTypeID : PeriodTypeID,
      Period : Period,
      ChannelGroupID : ChannelGroupID,
      Filter : filter
    }
    console.log(request)
    //loadingstate()
    $.get(window.location.href + "channelperformance", request, function(data){
      navmodule.init_ChannelPerformance(data,ChannelGroupID)
    });
  },
  /*
  ===== initialize performance
  */
  init_ChannelPerformance : function(data,ChannelGroupID){
    if(data.length > 0){      
      console.log(data)
      var ChannelID = [];
      var PlatformName = [];
      for(var i in data){
        var TempChannelID = ChannelGroupID != 2000 ? data[i].ChannelID : data[i].ChannelGroupID;
        ChannelID.push(TempChannelID)
        PlatformName.push(data[i].PlatFormName)
      }
      ChannelID = _.uniq(ChannelID);
      var Formname = _.uniq(PlatformName);
      var PerformanceChannels = []
      var totalLinear = [];
      var PlatFormIDs = []
      for(var i in ChannelID){        
        var Channels = [];
        var ChannelName = "";
        for(var x in data){        
          if(ChannelGroupID != 2000){
            var TempChannelID = data[x].ChannelID;
          }else{
            var TempChannelID = data[x].ChannelGroupID;
          }

          if(TempChannelID == ChannelID[i]){
            if(ChannelGroupID != 2000){
                ChannelName = ChannelName == "" ? data[x].ChannelName : data[x].ChannelName ;
            }else{
                ChannelName = ChannelName == "" ? data[x].ChannelGroupName : data[x].ChannelGroupName ;
            }
            PlatFormIDs.push(data[x].PlatFormID)
            if(data[x].PlatFormID == 1){
              if($('#unit').val() == 1){
                var avg = Number(data[x].Sum000).toFixed(2)
              }else{
                var avg = Number(data[x].SumATV).toFixed(2)
              }          
              totalLinear = Number(totalLinear) + Number(avg)
            }

            Channels.push({
              PlatFormID : data[x].PlatFormID,
              PlatFormName : data[x].PlatFormName,
              Sum000 : data[x].Sum000,
              SumATV : data[x].SumATV,
            })
          }
        }

        PerformanceChannels.push({
          ChannelID : ChannelID[i],
          ChannelName : ChannelName,
          Channels : Channels,
        })

      }
      console.log(PerformanceChannels)
      var delivered = false;
      var totalCell = false;
      var tdwidth = 100 / (Formname.length + 2)

      var GetChannelIDs = [];
      var GetPlatFormIDs = [];
      for(var i in PerformanceChannels){
        GetChannelIDs.push(PerformanceChannels[i].ChannelID)
        for(var x in PerformanceChannels[i].Channels){
          GetPlatFormIDs.push(PerformanceChannels[i].Channels[x].PlatFormID)
        }
      }    

      var output = '<table class="table-bordered table-channelperformance" id="table-channelperformance" width="100%">';
        output += '<thead class="bg-white"><tr><td width="250"></td>';
      for(var i in Formname){
        output += '<td class="text-center"><img height="50" src="channel/'+ Formname[i] +'.png" alt="'+ Formname[i] +'"></td>';
      }
        output += '<td class="text-center bg-light" width="150"><img width="25" src="channel/globe.png" class="img-responsive">&nbsp;&nbsp;<small>TOTAL</small></td>';
        output += '</tr></thead><tbody>';
      for(var i in PerformanceChannels){
        if(PerformanceChannels[i].ChannelName.indexOf('TNT Comedy HD') == -1){
          var logo = PerformanceChannels[i].ChannelName.replace('.', '-');
        }else{
          var logo = 'TNT Comedy';
        }            
        if($('#channelgroup').val() == 1){
          var size = 30
        }else{
          var size = 40
        }
        var totalAvgVal = 0;
        output += '<tr>';
        if(PerformanceChannels[i].ChannelName != ''){
          output += '<td>'+ PerformanceChannels[i].ChannelName +'<img width="30" class="float-right" src="logo/'+ logo.replace('+', '-') +'.png" class="img-responsive"></td>';
        }else{
          output += '<td class="text-center bg-light"><img width="25" src="channel/globe.png" class="img-responsive">&nbsp;&nbsp;TOTAL</td>';
        }        
        for(var x in Formname){

          var flag = false;        
          for(var p in PerformanceChannels[i].Channels){
            if(PerformanceChannels[i].Channels[p].PlatFormName == Formname[x]){
              var PFormID = PerformanceChannels[i].Channels[p].PlatFormID;
              
              flag = true;
              console.log(delivered + "/" + $.inArray( activeChannel , GetChannelIDs ) + "/" + $.inArray( activePlatForm , GetPlatFormIDs ))
              if(delivered == false && $.inArray( activeChannel , GetChannelIDs ) == -1 || $.inArray( activePlatForm , GetPlatFormIDs ) == -1){
                if(ChannelGroupID != 2000){
                  var ChGroupID = -1;
                  var ChID = PerformanceChannels[i].ChannelID
                  activeChannel = ChID
                }else{
                  var ChGroupID = PerformanceChannels[i].ChannelID
                  var ChID = -1;
                  activeChannel = ChGroupID
                }
                activePlatForm = PFormID;
                var PFormID = PFormID
                var PtypeID = $('#periodtype').val()
                if(WPeriod != ''){
                  var Prange = WPeriod
                }else{
                  var Prange = navmodule.externalProgdate($('#customperiod').val())                            
                }              
                navmodule.init_ProgrammePerformance(ChGroupID,ChID,PFormID,PtypeID,Prange,PerformanceChannels[i].ChannelName,Formname[x],sort)
                navmodule.init_trending(-1,ChGroupID,ChID,PtypeID,Prange,PFormID,PerformanceChannels[i].ChannelName, Formname[x])
                delivered = true;
                var activecell = 'active'
              }else if(activeChannel == PerformanceChannels[i].ChannelID && activePlatForm == PFormID){
                if(ChannelGroupID != 2000){
                  var ChGroupID = -1;
                  var ChID = PerformanceChannels[i].ChannelID
                  activeChannel = ChID
                }else{
                  var ChGroupID = PerformanceChannels[i].ChannelID
                  var ChID = -1;
                  activeChannel = ChGroupID
                }
                activePlatForm = PFormID;
                var PFormID = PFormID
                var PtypeID = $('#periodtype').val()
                if(WPeriod != ''){
                  var Prange = WPeriod
                }else{
                  var Prange = navmodule.externalProgdate($('#customperiod').val()) 
                }  
                navmodule.init_ProgrammePerformance(ChGroupID,ChID,PFormID,PtypeID,Prange,PerformanceChannels[i].ChannelName,Formname[x],sort)
                navmodule.init_trending(-1,ChGroupID,ChID,PtypeID,Prange,PFormID,PerformanceChannels[i].ChannelName + " - " +Formname[x])
                delivered = true;
                var activecell = 'active rounded'
              }else{
                var activecell = ''
              }

              if($('#unit').val() == 1){
                var avgval = Number(PerformanceChannels[i].Channels[p].Sum000).toFixed(2)              
              }else{
                var avgval = Number(PerformanceChannels[i].Channels[p].SumATV).toFixed(2)              
              }
              totalAvgVal = Number(totalAvgVal) + Number(avgval)

              if(PerformanceChannels[i].ChannelID != -1){
                output += '<td class="'+ activecell +'" id="'+PerformanceChannels[i].ChannelID+'" value="'+ PFormID +'" data-id="'+PerformanceChannels[i].ChannelName+'" data-value="'+ Formname[x] +'">'+ avgval + '</td>';
              }else{
                output += '<td class="'+ activecell +' bg-light" id="'+PerformanceChannels[i].ChannelID+'" value="'+ PFormID +'" data-id="'+Formname[x]+'" data-value="TOTAL">'+ avgval +'</td>'
              }                            

              break;
            }
          }

          if(flag == false){
            output += '<td> - </td>';
          }

        }
        if(activePlatForm == -1 && activeChannel == PerformanceChannels[i].ChannelID){
          var activeTotalCell = 'active rounded'
        }else{
          var activeTotalCell = ''
        }
        if(PerformanceChannels[i].ChannelName != ''){
          output += '<td class="'+ activeTotalCell +' bg-light" id="'+PerformanceChannels[i].ChannelID+'" value="-1" data-id="'+PerformanceChannels[i].ChannelName+'" data-value="Total">'+ Number(totalAvgVal).toFixed(2) +'</td>';
        }else{
          output += '<td class="text-center">-</td>'
        }        
        output += '</tr>';
      }

      /*
      output += '<tr class="bg-light">'
      output += '<td class="align-middle"><img width="25" src="channel/globe.png" class="img-responsive">&nbsp;&nbsp;TOTAL</td>';      
      PlatFormIDs = _.uniq(PlatFormIDs)
      for(var f in Formname){
        var sumavg = 0;        
        for(var p in PerformanceChannels){          
          for(var  c in PerformanceChannels[p].Channels){            
            if(PerformanceChannels[p].Channels[c].PlatFormName == Formname[f]){
              if($('#unit').val() == 1){
                var avgval = Number(PerformanceChannels[p].Channels[c].Sum000).toFixed(2)              
              }else{
                var avgval = Number(PerformanceChannels[p].Channels[c].SumATV).toFixed(2)              
              }             
              sumavg += Number(avgval);
            }
          }
        }        
        output += '<td class="text-center" id="-1" value="'+ PlatFormIDs[f] +'" data-id="'+Formname[f]+'" data-value="TOTAL">'+ Number(sumavg).toFixed(2) +'</td>'        
      }
      */
      output += '<td class="text-center"></td>'
      //id="'+PerformanceChannels[i].ChannelID+'" value="-1" data-id="Linear" data-value="Total"
      
      
      output += '</tr>'
      output += '</tbody></table>';
      $('#channelperformance').scrollTop(0)
      $('#channelperformance').html(output)
      var channeltable = ($('#channelperformance').width() - 280) / Formname.length
      $('#channelperformance td:not(:first-child)').css({
        width : channeltable+'px',
      })
      var $table = $('table#table-channelperformance');
      $table.floatThead();      
      $('#table-channelperformance td:not(:first-child)').each(function(){
        $(this).click(function(){
          if($(this).attr("id")!= undefined){

            $('#table-channelperformance td:not(:first-child)').each(function(){
              $(this).removeClass('active')
            })
            $(this).addClass('active')
            if(ChannelGroupID != 2000){
              var ChGroupID = -1;
              var ChID = $(this).attr("id");
            }else{
              var ChGroupID = $(this).attr("id");
              var ChID = -1;
            }
            var ProgTitleID = -1;
            var PFormID = $(this).attr("value")
            var PtypeID = $('#periodtype').val()
            if(WPeriod != ''){
              var Prange = WPeriod
            }else{
              var Prange = navmodule.externalProgdate($('#customperiod').val())
            }  
                      
            activeChannel = $(this).attr("id");
            activePlatForm = $(this).attr("value")                      
            navmodule.init_ProgrammePerformance(ChGroupID,ChID,PFormID,PtypeID,Prange,$(this).data('id'),$(this).data('value'))          
            navmodule.init_trending(ProgTitleID,ChGroupID,ChID,PtypeID,Prange,PFormID,$(this).data('id') + ' - ' + $(this).data('value'))          

          }
        })
      })
    }else{
      $('#channelperformance').html('')
      $('#programeperformance').html('')
      $('#bargraph').html('')
    }    
  },
  /*
  ===== programme performance
  */
  init_ProgrammePerformance : function(ChGroupID,ChID,PFormID,PtypeID,Prange,ChannelName,FormName,SumSort){
    if(filterexist == true){
      var filter = $('#filterbmi').val()
    }else{
      var filter = ''
    }          

    request = {
      ChannelGroupID : ChGroupID,
      ChannelID : ChID,
      PlatFormID : PFormID,
      PeriodTypeID : PtypeID,
      Period : Prange,
      Filter : filter
    }
    console.log(request)
    $.get(window.location.href + "programmeperformance", request, function(data){
      if(SumSort == '000'){
        data.sort(function(a, b) {
          return b.Sum000 - a.Sum000;
        });
        var sort000 = '<img height="20" src="sort/sort.png" class="img-responsive float-right">'
        var sortCount = ''
        var sortATV = ''
      }else if(SumSort == 'Count'){
        data.sort(function(a, b) {
          return b.CNT - a.CNT;
        });
        var sort000 = ''
        var sortCount = '<img height="20" src="sort/sort.png" class="img-responsive float-right">'
        var sortATV = ''
      }else{
        data.sort(function(a, b) {
          return b.SumATV - a.SumATV;
        });
        var sort000 ='';
        var sortCount = ''
        var sortATV = '<img height="20" src="sort/sort.png" class="img-responsive float-right">'
      }      
      var output = '<table class="table table-bordered" id="table-programmeperformance" width="100%">';
      if(ChannelName.indexOf('TNT Comedy HD') == -1){
        var cname = ChannelName.replace('.', '-');
      }else{
        var cname = 'TNT Comedy';
      }    
      
      var form ='<img height="30" src="channel/'+ FormName +'.png" alt="'+ FormName +'">'
      output += '<thead class="bg-white">'+
        '<tr>'+
          '<td colspan="5">'+ form +'&nbsp;&nbsp;&nbsp;&nbsp;<img height="30" src="logo/'+ cname.replace('+', '-') +'.png"></td>'+          
        '</tr>'+
        '<tr>'+
          '<td width="300"><small>Programme Title</small></td>'+
          '<td><small>Sky 360 BMI</small></td>'+
          '<td id="sort" value="Count"><small>Count</small>'+ sortCount +'</td>'+
          '<td id="sort" value="000"><small>000</small>'+ sort000 +'</td>'+
          '<td id="sort" value="ATV"><small>ATV</small>'+ sortATV +'</td>'+          
        '</tr></thead><tbody>';
      
      for(var i in data){      
      output += '<tr id="'+ data[i].BMICode +'" value="'+ data[i].ProgrammeTitle +'">'+
          '<td><span>'+ data[i].ProgrammeTitle+'</span></td>'+
          '<td>'+ data[i].BMICode +'</td>'+
          '<td>'+data[i].CNT+'</td>'+
          '<td>'+ Number(data[i].Sum000).toFixed(2) +'</td>'+
          '<td>'+ Number(data[i].SumATV).toFixed(2) +'</td>'+          
        '</tr>';
      }      
      output += '</tbody></table>'
      $('#programeperformance').scrollTop(0)
      $('#programeperformance').html(output)               
      $('#table-programmeperformance #sort').each(function(){
        $(this).click(function(){   
          sort = $(this).attr('value')                      
          navmodule.init_ProgrammePerformance(ChGroupID,ChID,PFormID,PtypeID,Prange,ChannelName,FormName,$(this).attr('value'))
        })
      })
      $('#table-programmeperformance tr').each(function(){
        var ChannelGroupID = $('#channelgroup').val();
        $(this).click(function(){
          if($(this).attr("id")!= undefined){
            $('#table-programmeperformance tr').each(function(){
              $(this).removeClass('active')
            })
            $(this).addClass('active')           
            var BMIFiler = $(this).attr('id')
            $('#filterbmi').val(BMIFiler)
            filterexist = true;             
            navmodule.ChannelPerformanceRequest()
          }
        })
      })
      var $table = $('table#table-programmeperformance');      
      $table.floatThead({
        responsiveContainer: function($table){
            return $table.closest('.table-responsive');
        }
      });
    })
  },
  init_trending : function(ProgTitleID,ChGroupID,ChID,PtypeID,Prange,PFormID,TrendingTitle){
    
    if(filterexist == true){
      var filter = $('#filterbmi').val()
    }else{
      var filter = ''
    }


    TrendingProgTitleID = ProgTitleID;
    TrendingChannelGroupID = ChGroupID;
    TrendingChannelID = ChID;
    TrendingPeriodTypeID = PtypeID;
    TrendingPeriod = Prange;
    TrendingPlatFormID = PFormID;
    TrendingFilter = filter;

    request = {
      ProgTitleID : ProgTitleID,
      ChannelGroupID : ChGroupID,
      ChannelID : ChID,
      PeriodTypeID : PtypeID,
      Period : Prange,
      PlatFormID : PFormID,
      Filter : filter,
    }

    if($('#barnum').val() != '' && $.isNumeric($('#barnum').val()) == true && $('#barnum').val() <= 13){
      var barnum = Number($('#barnum').val())
    }else{
      var barnum = 13;
    }
    console.log(request)    
    $.get(window.location.href + "trending", request, function(data){
      console.log(data)

      var chartval = []
      var label = []
      var dataseries = []      
      var PlatFormIDnum = [];
      var num = $('#periodtype').val()      
      for(var i in data){        
        PlatFormIDnum.push(data[i].PlatFormID)
      }
      switch(num){
        case '1' :                    
            for(var i=scrollNum; i< Number(13 + scrollNum); i++){
              label.push(navmodule.externalProgdate(daterange[i],1))            
            }            
          break;
        case '2' :
            for(var i=scrollNum; i< Number(13 + scrollNum); i++){
              label.push(navmodule.externalProgdate(weekrange[i],2)) 
            } 
          break;
        case '3' :
            for(var i=scrollNum; i< Number(13 + scrollNum); i++){
              label.push(navmodule.externalProgdate(monthrange[i],3))
            } 
          break;
        case '4' :
            for(var i=scrollNum; i< Number(13 + scrollNum); i++){
              label.push(navmodule.externalProgdate(quarterrange[i],4)) 
            } 
          break;
        case '5' :        
          
          break;
      }
      
      label.sort(function(a, b){return a-b});      
      console.log(label)
      var uniqLabel = label
      var axislabel = []      
      for(var i = Number(13 - barnum); i<13;i++){
        axislabel.push(uniqLabel[i])
      }      
      var PFormIDs = _.uniq(PlatFormIDnum)
      var colorpick = ['#000','#a643c6','#ea5712','#110bc4']
      var colorpick1 = ['','#000','#a643c6','#ea5712','#110bc4']
      if(PFormIDs.length == 1){
        console.log('test')        
        var average = [];
        for(var x in axislabel){
          var lableexist = false;
          switch(num){
            case '1' :                              
              for(var i in data){
                if(axislabel[x] == data[i].ProgDate){
                  if(Number(x) < barnum){
                    if($('#unit').val() == 1){
                      average.push(Number(data[i].Sum000).toFixed(2))
                    }else{
                      average.push(Number(data[i].SumATV).toFixed(2))
                    }
                    lableexist = true;
                    break;
                  }                    
                }                
              }
              if(lableexist == false){
                average.push(Number(0).toFixed(2));
              }              
              break;
            case '2' :
              
              for(var i in data){
                if(axislabel[x] == data[i].WeekNumber){
                  if(Number(x) < barnum){
                    if($('#unit').val() == 1){
                      average.push(Number(data[i].Sum000).toFixed(2))
                    }else{
                      average.push(Number(data[i].SumATV).toFixed(2))
                    }
                    lableexist = true;
                    break;
                  }                    
                }                
              }
              if(lableexist == false){
                average.push(Number(0).toFixed(2));
              } 

              break;
            case '3' :
              
              for(var i in data){
                if(axislabel[x] == data[i].MonthNumber){
                  if(Number(x) < barnum){
                    if($('#unit').val() == 1){
                      average.push(Number(data[i].Sum000).toFixed(2))
                    }else{
                      average.push(Number(data[i].SumATV).toFixed(2))
                    }
                    lableexist = true;
                    break;
                  }                    
                }                
              }
              if(lableexist == false){
                average.push(Number(0).toFixed(2));
              } 

              break;
            case '4' :
              
              for(var i in data){
                if(axislabel[x] == data[i].QuarterNumber){
                  if(Number(x) < barnum){
                    if($('#unit').val() == 1){
                      average.push(Number(data[i].Sum000).toFixed(2))
                    }else{
                      average.push(Number(data[i].SumATV).toFixed(2))
                    }
                    lableexist = true;
                    break;
                  }                    
                }                
              }
              if(lableexist == false){
                average.push(Number(0).toFixed(2));
              } 

              break;
            case '5' :        
              
              break;
          }
        }        
        dataseries = [{
          name: "Sample title",
          type: magicType,
          data: average,
          stack : 'stack',
          label: {
              normal: {
                  show: false,
                  color : '#000',
                  fontSize: 9,
                  position: 'top',
                  formatter : '{c}'
              }
          },
          itemStyle : {  
            normal: {
                barBorderWidth: 0,
                barBorderColor: colorpick1[PFormIDs[0]],
                color: colorpick1[PFormIDs[0]]
            },
            emphasis: {
              barBorderColor: colorpick1[PFormIDs[0]],
              color: colorpick1[PFormIDs[0]]
            }
          },
          markPoint: {
              clickable: true,
              symbol: 'pin',
              symbolSize: 80,
              symbolRotate: null,
              large: false
          }
        }]
        var topxAxis = average;
      }else{
        for(var i in PFormIDs){
          var average = []
          for(var x in data){
            if(PFormIDs[i] == data[x].PlatFormID){
              if(Number(x) < barnum){
                if($('#unit').val() == 1){
                  average.push(Number(data[x].Sum000).toFixed(2))
                }else{
                  average.push(Number(data[x].SumATV).toFixed(2))
                }
              }              
            }
          }        
          dataseries.push({
            name: "Sample title",
            type: magicType,
            data: average,
            stack : 'stack',
            label: {
                normal: {
                    show: false,
                    color : '#000',
                    fontSize: 9,
                    position: 'top',
                    formatter : '{c}'
                }
            },
            itemStyle : {  
              normal: {
                  barBorderWidth: 0,
                  barBorderColor: colorpick[i],
                  color: colorpick[i]
              },
              emphasis: {
                barBorderColor: colorpick[i],
                color: colorpick[i]
              }
            },
            markPoint: {
                clickable: true,
                symbol: 'pin',
                symbolSize: 80,
                symbolRotate: null,
                large: false
            }
          })
        }
        var topxAxis = []        
        var refdate = [];   
        for(var i = Number(13 - barnum); i<13;i++){
          switch(num){
            case '1' :        
              refdate.push(data[i].ProgDate)
              break;
            case '2' :
              refdate.push(data[i].WeekNumber)
              break;
            case '3' :
              refdate.push(data[i].MonthNumber)
              break;
            case '4' :
              refdate.push(data[i].QuarterNumber)
              break;
            case '5' :        
              refdate.push(data[i].YearNumber)
              break;
          }                        
        }           
        refdate = _.uniq(refdate)        
        for(var i in refdate){         
          if(Number(i) < barnum){
            var sum = 0;
            for(var x in data){
              switch(num){
                case '1' :        
                  if(refdate[i] == data[x].ProgDate){         
                    if($('#unit').val() == 1){                
                      sum += parseFloat(Number(data[x].Sum000).toFixed(2))
                    }else{
                      sum += parseFloat(Number(data[x].SumATV).toFixed(2))
                    }                       
                  }
                  break;
                case '2' :
                  if(refdate[i] == data[x].WeekNumber){         
                    if($('#unit').val() == 1){                
                      sum += parseFloat(Number(data[x].Sum000).toFixed(2))
                    }else{
                      sum += parseFloat(Number(data[x].SumATV).toFixed(2))
                    }                       
                  }
                  break;
                case '3' :
                  if(refdate[i] == data[x].MonthNumber){         
                    if($('#unit').val() == 1){                
                      sum += parseFloat(Number(data[x].Sum000).toFixed(2))
                    }else{
                      sum += parseFloat(Number(data[x].SumATV).toFixed(2))
                    }                       
                  }
                  break;
                case '4' :
                  if(refdate[i] == data[x].QuarterNumber){         
                    if($('#unit').val() == 1){                
                      sum += parseFloat(Number(data[x].Sum000).toFixed(2))
                    }else{
                      sum += parseFloat(Number(data[x].SumATV).toFixed(2))
                    }                       
                  }
                  break;
                case '5' :        
                  if(refdate[i] == data[x].YearNumber){         
                    if($('#unit').val() == 1){                
                      sum += parseFloat(Number(data[x].Sum000).toFixed(2))
                    }else{
                      sum += parseFloat(Number(data[x].SumATV).toFixed(2))
                    }                       
                  }
                  break;
              }            
            }
            topxAxis.push(sum)
          }          
        }
        console.log(topxAxis)
        for(var i in topxAxis){
          topxAxis[i] = Number(topxAxis[i]).toFixed(2)
        }        
      }      
      


      var echartBar = echarts.init(document.getElementById('bargraph'));
      echartBar.on('magictypechanged', function(params) {
          magicType = params.currentType;
      });
      echartBar.setOption({
        title: {
            text: TrendingTitle,
            textStyle: {
                fontSize: 20,
                //fontFamily: 'Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif',
                fontWeight: 'normal',
                extraCssText: 'left: 0px'
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            },
            backgroundColor: 'rgba(245, 245, 245, 0.8)',
            borderWidth: 1,
            borderColor: '#ccc',
            formatter: '{b}: {c}',
            padding: 10,
            textStyle: {
                color: '#000'
            },
            position: function(pos, params, el, elRect, size) {
               var obj = {top: 10};
                obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                return obj;
            },
            show : false,
            extraCssText: 'width: 170px'
        },
        toolbox: {
            show: true,
            feature: {
                mark : {show: true},                
                dataView: {
                    show: false,
                    title: "Text View",
                    lang: [
                        "Text View",
                        "Close",
                        "Refresh",
                    ],
                    readOnly: false
                },
                magicType: {
                    show: true,
                    type: ['line', 'bar'],
                    title: {
                        line: 'Line Chart',
                        bar: 'Bar Chart',
                        stack: 'Stacked Chart',
                        tiled: 'Tiled Chart',
                    }
                },
                restore: {
                    show: false,
                    title: "Restore"
                },
                saveAsImage: {
                    show: true,
                    title: "Save Image"
                },                              
            }
        },
        legend: {
            data: ['Sample title'],
            show : false,            
        },
        grid: {
            left: '60',
            right: '0%',
            bottom: '40',
            top: '20%',
            containLabel: true
        },
        yAxis: {                    
            type: 'value',
            name: $("#unit option:selected").text(),
            nameLocation: 'middle',
            nameGap: 60,
            nameTextStyle : {
              fontSize : 14,
            },                
            scale: 3,
            label: {
                normal: {
                    show: true,
                    position: 'top'
                }
            }
        },
        xAxis: [{
                type: 'category',
                data: axislabel,                
                name: $("#periodtype option:selected").text(),
                nameLocation: 'middle',
                nameGap: 40,
                nameTextStyle : {
                  fontSize : 14,
                }
            },
            {
                type: 'category',
                position: 'top',
                onZero: true,
                xAxisIndex: 1,
                yAxisIndex: 1,
                zAxisIndex: 1,
                scale: true,                                      
                axisLabel: {
                    show: true,
                    /*formatter: '{value}' + PutPctg(),
                    textStyle: {
                        color: function(v) {
                            if (v >= 0) {
                                return 'green'
                            } else {
                                return 'red'
                            }
                        }
                    },*/                                
                },
                data: topxAxis
            }
        ],
       calculable : true,
          series: dataseries
    });
    })
  },
  /*
  ===== Change value on period range
  */
  initperiod : function(periodtype){
    scrollNum = 0;
    switch(periodtype){
      case '1' :        
        scrollLen = daterange.length - 1;
        $('#customperiod').val(daterange[0])
        break;
      case '2' :
        scrollLen = weekrange.length - 1;
        $('#customperiod').val(weekrange[0]) 
        break;
      case '3' :
        scrollLen = monthrange.length - 1;
        $('#customperiod').val(monthrange[0])
        break;
      case '4' :
        scrollLen = quarterrange.length - 1;
        $('#customperiod').val(quarterrange[0])
        break;
      case '5' :        
        scrollLen = yearrange.length - 1;
        $('#customperiod').val(yearrange[0])
        break;
    }
    navmodule.scrollproperty()
  },
  periodscroll : function(scrollType){
    if(scrollType == 'prev'){
      if(scrollLen > scrollNum){
        scrollNum++;
      }
    }else{
      if(scrollNum > 0){
        scrollNum--;
      }
    }
    var num = $('#periodtype').val()
    switch(num){
      case '1' :        
        $('#customperiod').val(daterange[scrollNum])
        break;
      case '2' :
        $('#customperiod').val(weekrange[scrollNum])        
        break;
      case '3' :
        $('#customperiod').val(monthrange[scrollNum])        
        break;
      case '4' :
        $('#customperiod').val(quarterrange[scrollNum])        
        break;
      case '5' :        
        $('#customperiod').val(yearrange[scrollNum])        
        break;
    }   
    navmodule.scrollproperty()
  },
  scrollproperty : function(){
    navmodule.ChannelPerformanceRequest()
    if(scrollNum == 0 && scrollLen > 0){
      $('#next').prop('disabled',true)
      $('#prev').prop('disabled',false)
    }else if(scrollNum == 0 && scrollLen == 0){
      $('#prev').prop('disabled',true)
      $('#next').prop('disabled',true)
    }else if(scrollNum == scrollLen){
      $('#next').prop('disabled',false)
      $('#prev').prop('disabled',true)
    }else{
      $('#prev').prop('disabled',false)
      $('#next').prop('disabled',false)
    }
  }
}
/*
===== show/hide when channelgroup type ID is 1 or not
*/
function holdervisibility(ChannelID){
  if(ChannelID == 1){
    $('#channelgroupholder').fadeIn()
  }else{
    $('#channelgroupholder').fadeOut()
  }
}
function loadingstate(){
  box = bootbox.dialog({
    message: '<p class="text-center align-middle"><img height="40" src="icon/loading.gif"></p>',
    closeButton: false,
  });
  var dialog = box.find('.modal-dialog');
  box.css('display', 'block');    
  dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 2)); 
  $(document).ajaxStop(function() {    
    box.modal('hide')        
  });
}
$(function(){  

  navmodule.initnav($('#channelgroup').val(),'channelgroup',$('#periodtype').val())
  /*
  ===== Bind trigger for channelgroup
  */  

  $('#channelview').on('change',function(){
    activeChannel = 0;
    activePlatForm = 0;
    holdervisibility($(this).val())
    navmodule.ChannelPerformanceRequest()
  })
  $('#channelgroup').on('change',function(){
    navmodule.ChannelPerformanceRequest()
  })
  /*
  ===== Bind trigger for period range
  */
  $('#periodtype').on('change',function(){
    WPeriod = ''    
    navmodule.initperiod($(this).val())
  })
  /*
  ===== Bind next period when #next is click
  */
  $('#next').click(function(){
    $('#customperiod').val('')
    WPeriod = ''
    navmodule.periodscroll('next')
  })
  /*
  ===== Bind pervious period when #prev is click
  */
  $('#prev').click(function(){
    $('#customperiod').val('')
    WPeriod = ''
    navmodule.periodscroll('prev')
  })
  /*
  ===== Bind prev and next when period changed
  */

  $('#unit').change(function(){
    navmodule.ChannelPerformanceRequest()
  })
  var tto;
  $('#barnum').on('input',function(){
    if($(this).val() != '' && $.isNumeric($(this).val()) == true && $(this).val() <= 15){
      clearTimeout(tto);
      tto = setTimeout(function(){      
        navmodule.init_trending(TrendingProgTitleID,TrendingChannelGroupID,TrendingChannelID,TrendingPeriodTypeID,TrendingPeriod,TrendingPlatFormID,TrendingFilter)
      },1000)    
    }    
  })
  //daterange weekrange monthrange quarterrange yearrange 
  $('#customperiod').on('input',function(){
    var char = $('#customperiod').val()
    clearTimeout(wto);
    wto = setTimeout(function() {
      if($('#customperiod').val().length == 6){
        if($.inArray( $('#customperiod').val(), daterange ) != -1){            
          periodcheck = true;
          $('#periodtype').val(1)            
          scrollNum = $.inArray( $('#customperiod').val(), daterange )            
          navmodule.scrollproperty()
          $('#periodrange').val($('#customperiod').val())
        }else{
          periodcheck = false;
        }
      }if($('#customperiod').val().length == 4 && $.isNumeric(char.charAt(2)) == true ){
        if($.inArray( $('#customperiod').val(), weekrange ) != -1){            
          periodcheck = true;
          $('#periodtype').val(2)            
          scrollNum = $.inArray( $('#customperiod').val(), weekrange )            
          navmodule.scrollproperty()
          $('#periodrange').val($('#customperiod').val())
        }else{
          periodcheck = false;
        }
      }if(($('#customperiod').val().length == 4 || $('#customperiod').val().length == 5) && (char.charAt(2) == 'm' || char.charAt(2) == 'M' ) ){
        if($.inArray( $('#customperiod').val(), monthrange ) != -1){            
          periodcheck = true;
          $('#periodtype').val(3)            
          scrollNum = $.inArray( $('#customperiod').val(), monthrange )            
          navmodule.scrollproperty()
          $('#periodrange').val($('#customperiod').val())
        }else{
          periodcheck = false;
        }
      }if(($('#customperiod').val().length == 4 || $('#customperiod').val().length == 5) && (char.charAt(2) == 'q' || char.charAt(2) == 'Q') ){
        if($.inArray( $('#customperiod').val(), quarterrange ) != -1){            
          periodcheck = true;
          $('#periodtype').val(4)            
          scrollNum = $.inArray( $('#customperiod').val(), quarterrange )            
          navmodule.scrollproperty()
          $('#periodrange').val($('#customperiod').val())
        }else{
          periodcheck = false;
        }
      }if($('#customperiod').val().length == 2){
        if($.inArray( $('#customperiod').val(), yearrange ) != -1){            
          periodcheck = true;
          $('#periodtype').val(5)            
          scrollNum = $.inArray( $('#customperiod').val(), yearrange )            
          navmodule.scrollproperty()
          $('#periodrange').val($('#customperiod').val())
        }else{
          periodcheck = false;
        }
      }else{
        periodcheck = false;
      }   
    },1000);      
  })

  $('#filterbmi').keydown(function(e){    
    switch(e.which){
      case 13:
        if(listnum > 0){          
          $('#filterbmi').val($( "#list li:nth-child("+ listnum +")" ).data('value'))
          filterexist = true
          navmodule.ChannelPerformanceRequest()
          $('.dropdown-content').hide();
          lilength = 0;
          $('#list').html('')
        }
      break;
      case 38: // up
        if(listnum > 0){
          listnum--;        
          var $target = $('#list');
          if ($target.find("li").length > 0) {
              $('#list li').each(function(){
                $(this).removeClass('bg-light')
              }) 
              $( "#list li:nth-child("+ listnum +")" ).addClass('bg-light')            
              if($('#list').scrollTop() > 0){
                $('#list').scrollTop(Number($('#list').scrollTop() - 40))
              }
          }
        }        
      break;
      case 40: // down
        if(listnum < lilength){
          listnum++;               
          var $target = $('#list');
          if ($target.find("li").length > 0) {
              $('#list li').each(function(){
                $(this).removeClass('bg-light')
              }) 
              $( "#list li:nth-child("+ listnum +")" ).addClass('bg-light')            
              if(listnum >= 8){
                $('#list').scrollTop(Number($('#list').scrollTop() + 40))
              }
          }
        }        
      break;
    }
  })

  $('#filterbmi').on('input',function(e){
    var filtertext = $(this).val()
    filterexist = false
    clearTimeout(wto);
    $('.dropdown-content').hide();
    wto = setTimeout(function() {      
      request = {
        InputFilter : filtertext
      }
      if(filtertext != ''){
        $.get(window.location.href + "filtertitle", request,function(data){
          if(data.length > 0){
            var output = '';
            lilength = data.length
            for(var i in data){
              output += '<li data-value="'+data[i].ProgrammeTitle+'">'+ data[i].ProgrammeTitle +'</li>'
            }
            $('#list').html(output)
            $('#list li').each(function(){
              $(this).click(function(){                          
                $('#filterbmi').val($(this).data('value'))
                filterexist = true
                navmodule.ChannelPerformanceRequest()
                $('.dropdown-content').hide();
                lilength = 0;
                $('#list').html('')
              })
              $(this).hover(function(){
                listnum = Number($(this).index() + 1);
                $('#list li').each(function(){
                  $(this).removeClass('bg-light')
                })                
                //$(this).addClass('bg-light') 
                $( "#list li:nth-child("+ Number($(this).index() + 1) +")" ).addClass('bg-light')
              })
            })
            $('#list').scrollTop(0)
            $('.dropdown-content').show();                      
          }else{
            lilength = 0;
            $('.dropdown-content').hide();
          }
        })   
      }else{
        filterexist = false;
        navmodule.ChannelPerformanceRequest()
        $('.dropdown-content').hide();
        $('#list').html('')
      }
              
    }, 1000);    

  })
  function parsedperiod(cperiod){
    var character = cperiod.charAt(2)
    if(cperiod.length == 4 && $.isNumeric(cperiod)){
      WPeriod = '20' + '' + cperiod
      if($.inArray( WPeriod, weekrange ) != -1){                  
        $('#periodtype').val(2)           
        scrollNum = $.inArray( WPeriod, weekrange )                
      }
      navmodule.scrollproperty()
    }else if((cperiod.length == 4 || cperiod.length == 5) && (character == 'm' || character == 'M')){
      if(cperiod.length == 4){
        WPeriod = '20' + cperiod.substring(0, 2) + '0' + cperiod.substring(3, 4);        
      }else if(cperiod.length == 5){
        WPeriod = '20' + cperiod.substring(0, 2) + '' + cperiod.substring(3, 5);       
      }
      if($.inArray( WPeriod, monthrange ) != -1){                  
        $('#periodtype').val(3)           
        scrollNum = $.inArray( WPeriod, monthrange )        
      }
      navmodule.scrollproperty()
    }else if((cperiod.length == 4 || cperiod.length == 5) && (character == 'q' || character == 'Q')){
      if(cperiod.length == 4){
        WPeriod = '20' + cperiod.substring(0, 2) + '0' + cperiod.substring(3, 4);        
      }else if(cperiod.length == 5){
        WPeriod = '20' + cperiod.substring(0, 2) + '' + cperiod.substring(3, 5);       
      }
      if($.inArray( WPeriod, quarterrange ) != -1){                  
        $('#periodtype').val(4)           
        scrollNum = $.inArray( WPeriod, quarterrange )        
      }
      navmodule.scrollproperty()
    }else{
      WPeriod = '';      
    }
  }

  function periodrange(num){    
    switch(num){
      case '1' :
        if($('#customperiod').val().length == 6){
          if($.inArray( $('#customperiod').val(), daterange ) != -1){            
            periodcheck = true;            
            scrollNum = $.inArray( $('#customperiod').val(), daterange )            
            navmodule.scrollproperty()
            $('#periodrange').val($('#customperiod').val())
          }else{
            periodcheck = false;
          }
        }else{
          periodcheck = false;
        }
        break;
      case '2' :
        if($('#customperiod').val().length == 6){
          if($.inArray( $('#customperiod').val(), weekrange ) != -1){            
            periodcheck = true;         
            scrollNum = $.inArray( $('#customperiod').val(), weekrange )
            navmodule.scrollproperty()
            $('#periodrange').val($('#customperiod').val())
          }else{
            periodcheck = false;
          }
        }else{
          periodcheck = false;
        }
        break;
      case '3' :
        if($('#customperiod').val().length == 6){
          if($.inArray( $('#customperiod').val(), monthrange ) != -1){            
            periodcheck = true;                        
            scrollNum = $.inArray( $('#customperiod').val(), monthrange )
            navmodule.scrollproperty()
            $('#periodrange').val($('#customperiod').val())
          }else{
            periodcheck = false;
          }
        }else{
          periodcheck = false;
        }
        break;
      case '4' :
        if($('#customperiod').val().length == 6){
          if($.inArray( $('#customperiod').val(), quarterrange ) != -1){            
            periodcheck = true;            
            scrollNum = $.inArray( $('#customperiod').val(), quarterrange )
            navmodule.scrollproperty()
            $('#periodrange').val($('#customperiod').val())
          }else{
            periodcheck = false;
          }
        }else{
          periodcheck = false;
        }
        break;
      case '5' :
        if($('#customperiod').val().length == 4){
          if($.inArray( $('#customperiod').val(), yearrange ) != -1){            
            periodcheck = true;            
            scrollNum = $.inArray( $('#customperiod').val(), yearrange )
            navmodule.scrollproperty()
            $('#periodrange').val($('#customperiod').val())
          }else{
            periodcheck = false;
          }
        }else{
          periodcheck = false;
        }
        break;
    }
  }

})
