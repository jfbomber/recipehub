/**
 * 
 * Section for the Create Recipe Table View
 * 
 * @param {Object} name
 */
function FormTableViewSection(name) {
    var headerView = Ti.UI.createView({
        backgroundColor : '#c0c0c0',
        height : '25dp' 
    });
    
    headerView.add(Ti.UI.createLabel({
        text : name,
        color : 'White',
        font : { fontSize : '12dp', fontWeight : 'bold' },
        left : '12dp' 
    }));
    
    var section = Ti.UI.createTableViewSection({
        headerView : headerView 
    });
    
    return section;
}

module.exports = FormTableViewSection;