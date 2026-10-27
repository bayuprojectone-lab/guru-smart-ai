
/* Format profesional untuk seluruh ekspor Excel; data dan proses ekspor asli tetap dipertahankan. */
/* (Ditunda sampai library Excel siap — dipanggil otomatis oleh Mesin Loading Kilat) */
window.__gsInstallExcelFormat=function(){
  if(typeof XLSX==='undefined'||!XLSX.writeFile||XLSX.__guruExcelFormatInstalled)return;
  var originalWriteFile=XLSX.writeFile;
  XLSX.writeFile=function(wb,filename,opts){
    try{
      (wb.SheetNames||[]).forEach(function(sheetName){
        var ws=wb.Sheets[sheetName]; if(!ws||!ws['!ref'])return;
        var range=XLSX.utils.decode_range(ws['!ref']);
        var border={top:{style:'thin',color:{rgb:'CBD5E1'}},bottom:{style:'thin',color:{rgb:'CBD5E1'}},left:{style:'thin',color:{rgb:'CBD5E1'}},right:{style:'thin',color:{rgb:'CBD5E1'}}};
        var headerRows=[];
        for(var r=range.s.r;r<=range.e.r;r++){
          var vals=[]; for(var c=range.s.c;c<=range.e.c;c++){var cc=ws[XLSX.utils.encode_cell({r:r,c:c})];vals.push(cc?String(cc.v==null?'':cc.v).trim():'');}
          if(vals.some(function(v){return v==='No';})&&vals.some(function(v){return v==='Nama';})&&(vals.some(function(v){return v==='NIS';})||vals.some(function(v){return /^Tgl\s*\d+$/i.test(v);})))headerRows.push(r);
        }
        for(var r=range.s.r;r<=range.e.r;r++){
          var rowHasValue=false; for(var c=range.s.c;c<=range.e.c;c++){var x=ws[XLSX.utils.encode_cell({r:r,c:c})];if(x&&x.v!==undefined&&x.v!==null&&String(x.v)!==''){rowHasValue=true;break;}}
          if(!rowHasValue)continue;
          for(var c=range.s.c;c<=range.e.c;c++){
            var addr=XLSX.utils.encode_cell({r:r,c:c}); var cell=ws[addr]; if(!cell)continue;
            cell.s=cell.s||{};
            cell.s.alignment={horizontal:'center',vertical:'center',wrapText:true};
            cell.s.border=border;
            if(headerRows.indexOf(r)!==-1){cell.s.fill={patternType:'solid',fgColor:{rgb:'1E3A8A'}};cell.s.font={bold:true,color:{rgb:'FFFFFF'},name:'Arial',sz:10};}
            else if(typeof cell.v==='string'&&(/^(DATA SISWA|DAFTAR HADIR SISWA|DAFTAR HADIR KEGIATAN)$/.test(cell.v.trim()))){cell.s.fill={patternType:'solid',fgColor:{rgb:'DBEAFE'}};cell.s.font={bold:true,color:{rgb:'1E3A8A'},name:'Arial',sz:12};}
            else if(r<=4&&typeof cell.v==='string'&&cell.v.trim()){cell.s.font={bold:r===1||r===3,color:{rgb:'1F2937'},name:'Arial',sz:r===1?14:10};}
            else {cell.s.font=Object.assign({name:'Arial',sz:10},cell.s.font||{});if((r%2)===0)cell.s.fill={patternType:'solid',fgColor:{rgb:'F8FAFC'}};}
          }
        }
        ws['!rows']=ws['!rows']||[];
        for(var r=range.s.r;r<=range.e.r;r++)if(headerRows.indexOf(r)!==-1)ws['!rows'][r]=Object.assign({},ws['!rows'][r]||{},{hpt:30});
        ws['!autofilter']=ws['!autofilter']||{ref:XLSX.utils.encode_range({s:{r:headerRows.length?headerRows[0]:range.s.r,c:range.s.c},e:range.e})};
      });
    }catch(e){console.warn('Pemformatan Excel:',e);}
    return originalWriteFile.call(this,wb,filename,opts);
  };
  XLSX.__guruExcelFormatInstalled=true;
};
