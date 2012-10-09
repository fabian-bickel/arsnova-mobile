/*--------------------------------------------------------------------------+
 This file is part of ARSnova.
 app/speaker/audienceQuestionPanel.js
 - Beschreibung: Panel zum Verwalten der Publikumsfragen.
 - Version:      1.0, 01/05/12
 - Autor(en):    Christian Thomas Weber <christian.t.weber@gmail.com>
 +---------------------------------------------------------------------------+
 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or any later version.
 +---------------------------------------------------------------------------+
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.
 +--------------------------------------------------------------------------*/
Ext.namespace('ARSnova.views.speaker');

ARSnova.views.speaker.AudienceQuestionPanel = Ext.extend(Ext.Panel, {
	scroll: 'vertical',
	
	/* toolbar items */
	toolbar		: null,
	backButton	: null,
	
	newQuestionButton: null,
	
	constructor: function(){
		this.newQuestionButton = [{
			xtype: 'form',
			cls  : 'standardForm topPadding',
			items: [{
				xtype	: 'button',				
				text	: Messages.NEW_QUESTION,
				cls		: 'forwardListButton',
				handler	: this.newQuestionHandler,
			}],
		}];
		
		this.backButton = new Ext.Button({
			text	: Messages.HOME,
			ui		: 'back',
			handler	: function() {
				var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
				sTP.inClassPanel.updateAudienceQuestionBadge();
				sTP.setActiveItem(sTP.inClassPanel, {
					type		: 'slide',
					direction	: 'right',
					duration	: 700,
				});
			},
		});
		
		this.addButton = new Ext.Button({
			text	: '+',
			cls		: 'plusButton',
			scope	: this,
			handler	: this.newQuestionHandler,
		});
		
		this.showcaseButton = new Ext.Button({
			cls		: "thm",
			text	: Messages.SHOWCASE,
			hidden	: true,
			scope	: this,
			handler	: this.showcaseHandler
		});
		
		this.toolbar = new Ext.Toolbar({
			title: Messages.QUESTIONS,
			items: [
		        this.backButton,
		        {xtype: 'spacer'},
		        this.showcaseButton,
		        this.addButton,
			]
		});
		
		this.dockedItems = [this.toolbar];
		this.items = [
          this.newQuestionButton
        ];
		
		ARSnova.views.speaker.AudienceQuestionPanel.superclass.constructor.call(this);
	},
	
	initComponent: function() {
		this.on('activate', this.onActivate);
		
		ARSnova.views.speaker.AudienceQuestionPanel.superclass.initComponent.call(this);
	},
	
	onActivate: function() {
		this.removeAll();

		ARSnova.questionModel.getSkillQuestionsSortBySubject(localStorage.getItem('sessionId'), {
    		success: this.questionsCallback,
    		failure: function(response) {
    			console.log('server-side error questionModel.getSkillQuestions');
    		},
		});
	},

	/**
	 * Callback Function for database.getAudienceQuestions
	 */
	questionsCallback: function(response){
		var createEntry = function(question, fieldset) {
			ARSnova.questionModel.countAnswersByQuestion(question._id, {
				success: function(response) {
					var answers = Ext.decode(response.responseText).rows;
					var numAnswers = answers.length > 0 ? answers[0].value : "";
					
					var status = "";
					if (question.active && question.active == 1)
						status = " isActive";
					
					var questionNumber = "";
					if(question.number)
						questionNumber = question.number + ". ";
					
					fieldset.add({
						xtype: 'button',
						cls: 'forwardListButton' + status,
						badgeCls: 'doublebadgeicon',
						text: questionNumber + question.text,
						questionObj: question,
						badgeText: numAnswers,
						handler: function(button) {
							Ext.dispatch({
								controller	: 'questions',
								action		: 'details',
								question	: button.questionObj,
							});
						}
					});
					
					panel.doLayout();
				},
				failure: function(response) {
					console.log("server-side error questionModel.countAnswersByQuestion");
				}
			});
		};
		
		var questions = Ext.decode(response.responseText).rows;
		var panel = ARSnova.mainTabPanel.tabPanel.speakerTabPanel.audienceQuestionPanel;
		
		if (questions.length == 0){
			console.log('Keine Session-Fragen gefunden!');
			panel.showcaseButton.hide();
			if (panel.items.length == 0) panel.add(panel.newQuestionButton);
		} else {
			panel.showcaseButton.show();
			var lastSubject = null;
			var fieldset = null;
			for(var i = 0; i < questions.length; i++){
				var question = questions[i].value;
				
				var actSubject = question.subject;
				if (lastSubject != actSubject) {
					fieldset = panel.add({
						xtype: 'fieldset',
						title: actSubject,
					});
					lastSubject = actSubject;
				}
				
				createEntry(question, fieldset);
			}
		}
		panel.doLayout();
		ARSnova.hideLoadMask();
	},
	
	newQuestionHandler: function(){
		var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.setActiveItem(sTP.newQuestionPanel, 'slide');
	},
	
	showcaseHandler: function() {
		var sTP = ARSnova.mainTabPanel.tabPanel.speakerTabPanel;
		sTP.setActiveItem(sTP.showcaseQuestionPanel, {
			type		: 'slide',
			direction	: 'up'
		});
	}
});