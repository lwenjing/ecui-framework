{foreach item="item" from=$controlTrees}
<div class="inher">
	<blockquote>
		<table class="clsSTD">
			<tr>
				<td>{control fileName=$item.fileName}</td>
				{if $item.brief}
				<td>{$item.brief}</td>
				{/if}
			</tr>
		</table>
	</blockquote>	
	
	<div class="uchildren">
	{if $item.children}
	<ul>
		{include file="controls-include.tpl" controlTrees=$item.children}
    </ul>
	{/if}
  </div>
</div>
{/foreach}