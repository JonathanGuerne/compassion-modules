# -*- encoding: utf-8 -*-
##############################################################################
#
#    Copyright (C) 2015 Compassion CH (http://www.compassion.ch)
#    Releasing children from poverty in Jesus' name
#    @author: Emanuel Cino <ecino@compassion.ch>
#
#    The licence is in the file __openerp__.py
#
##############################################################################

import logging
logger = logging.getLogger()


def update_projects(cr):
    """" Projects have now only one type for events. """
    cr.execute("UPDATE project_project SET project_type = 'event' "
               "WHERE project_type IN ('stand','concert','presentation',"
               "                       'meeting','sport')")


def update_analytic_accounts(cr):
    """ Change the naming scheme of the analytic accounts. """
    cr.execute("SELECT id from account_analytic_account "
               "WHERE name = 'Events'")
    root_id = cr.fetchone()[0]
    # Find all analytic accounts related to events projects
    cr.execute("SELECT analytic_account_id, id FROM project_project "
               "WHERE id IN (SELECT project_id FROM crm_event_compassion)")
    res_query = cr.fetchall()
    proj_event_analytic_ids = [str(r[0]) for r in res_query]
    proj_ids = [str(r[1]) for r in res_query]
    cr.execute(
        "SELECT currency_id, user_id, name, date_start, company_id, state, "
        "       manager_id, type, use_timesheets, use_tasks "
        "FROM account_analytic_account WHERE id IN ({0})".format(
            ','.join(proj_event_analytic_ids)))
    proj_event_analytic_data = cr.dictfetchall()

    # Create a Root Analytic Account for each Project
    for analytic_data in proj_event_analytic_data:
        # Change the name of the account (TODO : See if needed)
        # analytic_data['name'] = 'Project
        columns = ','.join(analytic_data.keys()) + ',parent_id'
        values = ','.join(['%s' for v in range(0, len(analytic_data))]) + ',' + \
            str(root_id)
        cr.execute(
            "INSERT INTO account_analytic_account({0}) VALUES ({1})".format(
                columns, values), analytic_data.values())

    # Attach old analytic accounts to the roots accounts created
    cr.execute(
        "UPDATE account_analytic_account a SET parent_id = ("
        "   SELECT max(id) from account_analytic_account "
        "   WHERE name = a.name AND id != a.id GROUP BY name), "
        "name = CONCAT(name)"   # TODO : See if we can rename
        "WHERE id IN ({0})".format(','.join(proj_event_analytic_ids)))

    # Attach Projects to new analytic accounts
    cr.execute(
        "UPDATE project_project p SET analytic_account_id = ("
        "   SELECT a.parent_id from account_analytic_account a "
        "   WHERE a.id = p.analytic_account_id) "
        "WHERE id IN ({0})".format(','.join(proj_ids)))


def migrate(cr, version):
    if not version:
        return

    # Change type of projects to event_id
    update_projects(cr)

    # Restructure analytic accounts
    update_analytic_accounts(cr)