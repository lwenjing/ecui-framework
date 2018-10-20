<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN">
<head>
<title>{$method.name}</title>
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
<h1><a>{$method.name} {if $method.isEvent}事件{else}方法{/if}</a></h1>
<hr size="1">
{if $method.brief}<p>{$method.brief}</p>{/if}
{if $method.desc}<p>{$method.desc}</p>{/if}
<p class="clsRef">{$method.name}</p>
<blockquote>
	<p>属于 {control fileName=$method.control.fileName}控件</p>
	{if $method.isOverride}<p>Override</p>{/if}
	{if $method.access}
		<p>{if $method.access=="protected"}<font color="red">访问控制属性：{$method.access};谨慎调用,编写自定义控件请谨慎使用此方法，普通开发请避免使用此方法</font>
		{else}访问控制属性：{$method.access}
		</p>{/if}
	{/if}
</blockquote>

{if $method.result}
<p class="clsRef">返回结果</p>
<blockquote>
	<table class="clsSTD">
		<tr>
			<td>{$method.result}</td>
		</tr>
	</table>
</blockquote>{/if}

<p class="clsRef">参数</p>
<blockquote>
	<table class="clsSTD">{foreach from=$method.params item="item"}
		<tr>
			<td>{$item.name}</td>
			<td>{if $item.des}{$item.desc}{/if}</td>
		</tr>
	{/foreach}
	</table>
</blockquote>

<div style="text-align:right"><a href="../control/{$method.control.fileName}.html">返回控件</a></div>
<div style="text-align:right"><a href="../controlTree.html">返回控件树</a></div>
<script>
if (document.getElementById('htmlDemo')) {
    document.getElementById('htmlDemo').innerHTML = encodeHTML(formatHTML(document.getElementById('htmlDemo').innerHTML)).toLowerCase();
    prettyPrint();
}
</script>
</body>
</html>