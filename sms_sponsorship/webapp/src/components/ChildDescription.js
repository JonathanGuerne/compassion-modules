import React from 'react';
import Typography from '@material-ui/core/Typography';

export default class extends React.Component {
    getDescriptionJson = () => {
        let div = document.createElement('div');
        div.innerHTML = this.props.appContext.state.child.description;
        let table = div.querySelector('table');

        function s(selector) {
            let elements = table.querySelectorAll(selector);
            switch(elements.length) {
                case 0:
                    return false;
                case 1:
                    return elements[0].innerHTML;
                default:
                    let result = [];
                    for (let i = 0; i < elements.length; i++) {
                        result.push(elements[i].innerHTML);
                    }
                    return result.join(", ");
            }
        }

        function labelValue(parentClass, childClass) {
            let result = {
                label: s(parentClass + ' .desc_label' + childClass),
                value: s(parentClass + ' .desc_value' + childClass),
            };
            return (result.label === false && result.value === false) ? false:result;
        }

        function labelValues(parentClass) {
            let result = {
                label: s(parentClass + ' ' + parentClass.replace('.', '#') + '_intro'),
                value: s(parentClass + ' ' + parentClass.replace('.', '#') + '_list li'),
            };
            return (result.label === false && result.value === false) ? false:result;
        }

        return {
            program_type: s('.program_type'),
            birthday_estimate: s('.birthday_estimate'),
            live_with: s('#live_with'),
            family: {
                // father_alive: labelValue('.father', '.is_alive'),
                father_job: labelValue('.father_job', '.job'),
                // mother_alive: labelValue('.mother', '.is_alive'),
                mother_job: labelValue('.mother_job', '.job'),
                brothers: labelValue('', '.brothers'),
                sisters: labelValue('', '.sisters'),
            },
            school: {
                school_attending: s('#school_attending'),
                school_performance: labelValue('', '.school_performance'),
                school_subject: labelValue('', '.school_subject'),
                vocational_training: labelValue('', '.vocational_training'),
            },
            house_duties: labelValues('.house_duties'),
            church_activities: labelValues('.church_activities'),
            hobbies: labelValues('.hobbies'),
            handicap: labelValues('.handicap'),
        };
    };

    render() {
        let description_json = this.getDescriptionJson();
        return (
            <div style={{marginTop: '8px', marginLeft: '8px'}}>
                {Object.keys(description_json).map(item => <ChildDescriptionItem key={item} label={item} value={description_json[item]}/>)}
            </div>
        )
    }
}

class ChildDescriptionItem extends React.Component {
    render() {
        const {value} = this.props;
        if (!value) {
            return "";
        }
        if (typeof value === 'object') {
            let keys = Object.keys(value);
            if (keys.length === 2 && value['label'] !== 'undefined') {
                return <Typography variant="caption" gutterBottom>{value.label + " " + value.value}</Typography>;
            }
            return (
                <div>
                    {keys.map(item => <ChildDescriptionItem key={item} label={item} value={value[item]}/>)}
                </div>
            )
        }
        return <Typography variant="caption" gutterBottom>{value}</Typography>;
    }
}