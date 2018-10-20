<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<html>
<head>
<title>{$control.name}</title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<script language="javascript" src="../common/common.js"></script>
<script language="javascript" src="../common/browdata.js"></script>
<script language="javascript" src="../common/appliesto2.js"></script>
<script language="javascript" src="../common/toolbar.js"></script>
<script language="javascript" src="../common/prettify.js"></script>
<link rel="stylesheet" type="text/css" href="../common/common.css" />
<link rel="stylesheet" type="text/css" href="../common/prettify.css" />
<style>
BODY
{
font-family:verdana,arial,helvetica;
padding:20px;
}
</style>
</head>
<body>
<h1><a>{$control.name} {if $control.type=="unit"}部件{else}控件{/if}</a></h1>
<hr size="1">
{if $control.brief}<p>{$control.brief}</p>{/if}
{if $control.parent}<p>继承自 {control fileName=$control.parent}</p>{/if}
<p><b>文件路径：</b>{$control.pathFrom}</p>
{if $control.access}<p><b>访问控制：</b></font>{$control.access}</p>{/if}
{if $control.style}<p><b>样式：</b>{$control.style}</p>{/if}
{foreach from=$control.abnormal item="item"}{if $item == 1}<font color="red">构造方法中没有call()</font>{/if}{/foreach}

{if $control.example}<p class="clsRef">使用方法</p>
<blockquote>
	<p>{$control.example}</p>
</blockquote>{/if}

{if $control.desc}<p class="clsRef">详情</p>
<blockquote>
	<p>{$control.desc}</p>
</blockquote>{/if}

<p class="clsRef">option支持的属性</p>
<blockquote>
  <table class="clsSTD">{foreach from=$control.optionParams item="item"}
  {if !$item.isEvent}
  <tr>
    <td>{$item.name}</td>
    <td>{$item.desc}</td>
  </tr>
  {/if}
  {/foreach}
  </table>
</blockquote>

<p class="clsRef">属性</p>
<blockquote>
	<table class="clsSTD">{foreach from=$control.variables item="item"}
	<tr>
		<td>{$item.name}</td>
		<td>{if $item.desc}{$item.desc};{/if}
		{if $item.repeat}<font color="red">{$item.repeat}{/if}</td>
	</tr>
		{/foreach}
	</table>
</blockquote>

<p class="clsRef">方法</p>
<blockquote>
  <table class="clsSTD">{foreach from=$control.methods item="item"}
  {if !$item.isEvent}
  <tr>
    <td>{method fileName=$item.fileName}</td>
    <td>{$item.brief}</td>
  </tr>
  {/if}
  {/foreach}
  </table>
</blockquote>

<p class="clsRef">事件</p>
<blockquote>
  <table class="clsSTD">{foreach from=$control.methods item="item"}
  {if $item.isEvent}
  <tr>
    <td>{method fileName=$item.fileName}</td>
    <td>{$item.brief}</td>
  </tr>
  {/if}
  {/foreach}
  </table>
</blockquote>

<p class="clsRef">子类</p>
<blockquote>
  <table class="clsSTD">{foreach from=$control.children item="item"}
  <tr>
    <td>{control fileName=$item.fileName}</td>
    <td>{$item.brief}</td>
  </tr>
  {/foreach}
  </table>
</blockquote>

<div style="text-align:right"><a href="../controlTree.html">返回</a></div>
<script>
if (document.getElementById('htmlDemo')) {
    document.getElementById('htmlDemo').innerHTML = encodeHTML(formatHTML(document.getElementById('htmlDemo').innerHTML)).toLowerCase();
    prettyPrint();
}
</script>
</body>
</html>
